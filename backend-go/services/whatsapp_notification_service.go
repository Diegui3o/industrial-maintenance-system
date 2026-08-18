package services

import (
	"backend/notifiers"
	"backend/repository"
	"log"
)

type WhatsAppNotificationService struct {
	client       *notifiers.WhatsAppNotifier
	whatsappRepo *repository.WhatsAppRepository
	equipoRepo   *repository.EquipoRepository
}

func NewWhatsAppNotificationService(
	client *notifiers.WhatsAppNotifier,
	whatsappRepo *repository.WhatsAppRepository,
	equipoRepo *repository.EquipoRepository,
) *WhatsAppNotificationService {
	return &WhatsAppNotificationService{
		client:       client,
		whatsappRepo: whatsappRepo,
		equipoRepo:   equipoRepo,
	}
}

// NotificarFallo envía un mensaje a todos los grupos vinculados al equipo
func (s *WhatsAppNotificationService) NotificarFallo(equipoID int, motivo string) {
	log.Printf("🔔 NotificarFallo llamado para equipo %d", equipoID)

	equipo, err := s.equipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("❌ Error obteniendo equipo %d: %v", equipoID, err)
		return
	}

	grupos, err := s.whatsappRepo.ObtenerGruposPorEquipo(equipoID)
	if err != nil {
		log.Printf("❌ Error obteniendo grupos para equipo %d: %v", equipoID, err)
		return
	}

	log.Printf("📋 Grupos encontrados para %s: %d", equipo.Nombre, len(grupos))
	for _, g := range grupos {
		log.Printf("   - Grupo: %s (JID: %s)", g.Nombre, g.JID)
	}

	if len(grupos) == 0 {
		log.Printf("⚠️ No hay grupos vinculados para %s", equipo.Nombre)
		return
	}

	mensaje := s.client.SendAlert(equipo.Nombre, motivo, "alta")

	for _, grupo := range grupos {
		err := s.client.SendToGroup(grupo.JID, mensaje)
		if err != nil {
			log.Printf("❌ Error enviando a %s: %v", grupo.Nombre, err)
		} else {
			log.Printf("✅ Alerta enviada a %s", grupo.Nombre)
		}
	}
}
