// services/eventos_service.go
package services

import (
	"backend/models"
	"backend/repository"
)

type EventosService struct {
	Repo             *repository.EventosRepository
	EquipoRepo       *repository.EquipoRepository
	auditoriaService *AuditoriaService
	alarmaService    *AlarmaService
}

func NewEventosService(
	repo *repository.EventosRepository,
	equipoRepo *repository.EquipoRepository,
	auditoriaService *AuditoriaService,
	alarmaService *AlarmaService,
) *EventosService {
	return &EventosService{
		Repo:             repo,
		EquipoRepo:       equipoRepo,
		auditoriaService: auditoriaService,
		alarmaService:    alarmaService,
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
	}

	return nil
}

func (s *EventosService) ObtenerHistorialEquipo(
	equipoID int,
) ([]models.EventoEstado, error) {
	return s.Repo.ObtenerHistorialEquipo(equipoID)
}
