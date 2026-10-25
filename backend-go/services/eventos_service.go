// services/eventos_service.go
package services

import (
	"backend/models"
	"backend/repository"
)

type EventosService struct {
	Repo                        *repository.EventosRepository
	EquipoRepo                  *repository.EquipoRepository
	auditoriaService            *AuditoriaService
	alarmaService               *AlarmaService
	whatsappNotificationService *WhatsAppNotificationService
}

func NewEventosService(
	repo *repository.EventosRepository,
	equipoRepo *repository.EquipoRepository,
	auditoriaService *AuditoriaService,
	alarmaService *AlarmaService,
	whatsappNotificationService *WhatsAppNotificationService,
) *EventosService {
	return &EventosService{
		Repo:                        repo,
		EquipoRepo:                  equipoRepo,
		auditoriaService:            auditoriaService,
		alarmaService:               alarmaService,
		whatsappNotificationService: whatsappNotificationService,
	}
}

func (s *EventosService) CambiarEstadoEquipo(
	equipoID int,
	nuevoEstado string,
	motivo string,
) error {
	estadoActual, err := s.Repo.ObtenerEstadoActualEquipo(equipoID)
	if err != nil {
		return err
	}

	if estadoActual == nuevoEstado {
		return nil
	}

	err = s.Repo.CambiarEstadoEquipo(equipoID, nuevoEstado, motivo)
	if err != nil {
		return err
	}

	s.auditoriaService.RegistrarCambioEstado(
		nil,
		equipoID,
		estadoActual,
		nuevoEstado,
		motivo,
	)

	if nuevoEstado == "fallo" {
		s.alarmaService.GenerarAlarmaPorFallo(equipoID, motivo)
		if s.whatsappNotificationService != nil {
			s.whatsappNotificationService.NotificarFallo(equipoID, motivo)
		}
	}

	if estadoActual == "fallo" && nuevoEstado == "activo" {
		if s.whatsappNotificationService != nil {
			s.whatsappNotificationService.NotificarRecuperacion(equipoID, motivo)
		}
	}

	return nil
}

func (s *EventosService) ObtenerHistorialEquipo(
	equipoID int,
) ([]models.EventoEstado, error) {
	return s.Repo.ObtenerHistorialEquipo(equipoID)
}
// CambiarEstadoActivo es como CambiarEstadoEquipo pero soporta
// componentes y repuestos. No crea alarma; eso lo hace AlarmaService.
func (s *EventosService) CambiarEstadoActivo(
	equipoID int,
	componenteID *int,
	repuestoID *int,
	tagID *int,
	parametro *string,
	nuevoEstado string,
	motivo string,
) error {
	// Para componentes/repuestos no verificamos el estado actual,
	// siempre registramos la transición porque puede haber múltiples
	// sensores afectando al mismo activo.
	if componenteID != nil && *componenteID > 0 {
		if err := s.Repo.CambiarEstadoActivo(
			equipoID, componenteID, nil, tagID, parametro,
			nuevoEstado, motivo,
		); err != nil {
			return err
		}
		s.auditoriaService.RegistrarCambioEstado(
			nil, equipoID, "", nuevoEstado, motivo,
		)
		return nil
	}
	if repuestoID != nil && *repuestoID > 0 {
		if err := s.Repo.CambiarEstadoActivo(
			equipoID, nil, repuestoID, tagID, parametro,
			nuevoEstado, motivo,
		); err != nil {
			return err
		}
		return nil
	}

	// Fallback al comportamiento legacy para equipos
	estadoActual, err := s.Repo.ObtenerEstadoActualEquipo(equipoID)
	if err != nil {
		return err
	}
	if estadoActual == nuevoEstado {
		return nil
	}
	if err := s.Repo.CambiarEstadoActivo(
		equipoID, nil, nil, tagID, parametro,
		nuevoEstado, motivo,
	); err != nil {
		return err
	}
	s.auditoriaService.RegistrarCambioEstado(
		nil, equipoID, estadoActual, nuevoEstado, motivo,
	)
	if nuevoEstado == "fallo" {
		if s.whatsappNotificationService != nil {
			s.whatsappNotificationService.NotificarFallo(equipoID, motivo)
		}
	}
	if estadoActual == "fallo" && nuevoEstado == "activo" {
		if s.whatsappNotificationService != nil {
			s.whatsappNotificationService.NotificarRecuperacion(equipoID, motivo)
		}
	}
	return nil
}