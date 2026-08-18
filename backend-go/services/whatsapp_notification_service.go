package services

import (
	"fmt"
	"log"

	"backend/repository"
)

type WhatsAppNotificationService struct {
	manager      *WhatsAppManager
	whatsappRepo *repository.WhatsAppRepository
	equipoRepo   *repository.EquipoRepository
}

func NewWhatsAppNotificationServiceConManager(
	manager *WhatsAppManager,
	whatsappRepo *repository.WhatsAppRepository,
	equipoRepo *repository.EquipoRepository,
) *WhatsAppNotificationService {
	return &WhatsAppNotificationService{
		manager:      manager,
		whatsappRepo: whatsappRepo,
		equipoRepo:   equipoRepo,
	}
}

func (s *WhatsAppNotificationService) NotificarFallo(equipoID int, motivo string) {
	equipo, err := s.equipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error obteniendo equipo %d: %v", equipoID, err)
		return
	}

	grupos, err := s.whatsappRepo.ObtenerGruposPorEquipo(equipoID)
	if err != nil || len(grupos) == 0 {
		log.Printf("No hay grupos para el equipo %s", equipo.Nombre)
		return
	}

	mensaje := fmt.Sprintf("🚨 *ALERTA DE FALLO*\n\nEquipo: %s\nMotivo: %s", equipo.Nombre, motivo)

	for _, cliente := range s.manager.ObtenerTodosClientes() {
		for _, grupo := range grupos {
			if cliente.IsLoggedIn() {
				if err := cliente.SendToGroup(grupo.JID, mensaje); err != nil {
					log.Printf("Error enviando a %s: %v", grupo.Nombre, err)
				} else {
					log.Printf("✅ Alerta enviada a %s", grupo.Nombre)
				}
			}
		}
	}
}

func (s *WhatsAppNotificationService) NotificarRecuperacion(equipoID int, motivo string) {
	equipo, err := s.equipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error obteniendo equipo %d: %v", equipoID, err)
		return
	}

	grupos, err := s.whatsappRepo.ObtenerGruposPorEquipo(equipoID)
	if err != nil || len(grupos) == 0 {
		log.Printf("No hay grupos para el equipo %s", equipo.Nombre)
		return
	}

	mensaje := fmt.Sprintf("✅ *EQUIPO RECUPERADO*\n\nEquipo: %s\nMotivo: %s", equipo.Nombre, motivo)

	for _, cliente := range s.manager.ObtenerTodosClientes() {
		for _, grupo := range grupos {
			if cliente.IsLoggedIn() {
				if err := cliente.SendToGroup(grupo.JID, mensaje); err != nil {
					log.Printf("Error enviando recuperación a %s: %v", grupo.Nombre, err)
				} else {
					log.Printf("✅ Recuperación enviada a %s", grupo.Nombre)
				}
			}
		}
	}
}
