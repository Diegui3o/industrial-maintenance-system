package services

import (
	"backend/models"
	"backend/repository"
)

type MantenimientoService struct {
	Repo *repository.MantenimientoRepository
}

func NewMantenimientoService(
	repo *repository.MantenimientoRepository,
) *MantenimientoService {
	return &MantenimientoService{
		Repo: repo,
	}
}

func (s *MantenimientoService) ListarPorEquipo(
	equipoID int,
) ([]models.Mantenimiento, error) {
	return s.Repo.ListarPorEquipo(equipoID)
}

func (s *MantenimientoService) ObtenerPorID(
	id int,
) (*models.Mantenimiento, error) {
	return s.Repo.ObtenerPorID(id)
}

func (s *MantenimientoService) Actualizar(
	id int,
	m models.Mantenimiento,
) error {
	return s.Repo.Actualizar(id, m)
}