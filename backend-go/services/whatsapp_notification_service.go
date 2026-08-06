package services

import (
	"backend/notifiers"
	"backend/repository"
	"log"
)

type WhatsAppNotificationService struct {
	client       *notifiers.WhatsAppNotifier // usa el notifier que ya tienes
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
	equipo, err := s.equipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error obteniendo equipo %d: %v", equipoID, err)
		return
	}

	grupos, err := s.whatsappRepo.ObtenerGruposPorEquipo(equipoID)
	if err != nil {
		log.Printf("Error obteniendo grupos para equipo %d: %v", equipoID, err)
		return
	}

	if len(grupos) == 0 {
		log.Printf("No hay grupos vinculados para el equipo %s", equipo.Nombre)
		return
	}

	// Usamos el formato de alerta que ya tienes
	mensaje := s.client.SendAlert(equipo.Nombre, motivo, "alta")

	for _, grupo := range grupos {
		if err := s.client.SendToGroup(grupo.JID, mensaje); err != nil {
			log.Printf("Error enviando WhatsApp al grupo %s: %v", grupo.Nombre, err)
		} else {
			log.Printf("✅ Alerta enviada al grupo %s por fallo de %s", grupo.Nombre, equipo.Nombre)
		}
	}
}
