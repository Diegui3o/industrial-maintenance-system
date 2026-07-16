// services/notifier_service.go
package services

import (
	"fmt"
	"log"

	"backend/notifiers"
	"backend/repository"
)

type NotifierService struct {
	WhatsApp   *notifiers.WhatsAppNotifier
	Email      *notifiers.EmailNotifier
	NotifRepo  *repository.NotificacionRepository
	GrupoRepo  *repository.WhatsAppRepository
	EquipoRepo *repository.EquipoRepository
}

func (s *NotifierService) NotificarFalloEquipo(equipoID int, motivo, severidad string) {
	equipo, err := s.EquipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		log.Printf("Error buscando equipo: %v", err)
		return
	}

	grupos, err := s.GrupoRepo.ObtenerGruposPorEquipo(equipoID)
	if err != nil {
		log.Printf("Error buscando grupos: %v", err)
		return
	}

	mensaje := s.WhatsApp.SendAlert(equipo.Nombre, motivo, severidad)

	for _, grupo := range grupos {
		if s.WhatsApp != nil {
			err := s.WhatsApp.SendToGroup(grupo.JID, mensaje)
			estado := "enviado"
			if err != nil {
				estado = "fallo"
				log.Printf("Error enviando WhatsApp a %s: %v", grupo.JID, err)
			}
			s.NotifRepo.Crear("whatsapp", grupo.JID, mensaje, estado)
		}
	}

	if s.Email != nil {
		subject := fmt.Sprintf("ALERTA: %s - %s", equipo.Nombre, severidad)
		_ = subject
	}
}
