package services

import (
	"backend/models"
	"backend/repository"
)

type TipoEquipoService struct {
	Repo *repository.TipoEquipoRepository
}

func NewTipoEquipoService(
	repo *repository.TipoEquipoRepository,
) *TipoEquipoService {
	return &TipoEquipoService{
		Repo: repo,
	}
}

func (s *TipoEquipoService) Listar() ([]models.TipoEquipo, error) {
	return s.Repo.Listar()
}

func (s *TipoEquipoService) Crear(
	tipo models.TipoEquipo,
) (models.TipoEquipo, error) {
	return s.Repo.Crear(tipo)
}

func (s *TipoEquipoService) Asignar(
	equipoID int,
	tipoEquipoID int,
) error {
	return s.Repo.Asignar(equipoID, tipoEquipoID)
}

func (s *TipoEquipoService) ListarPorEquipo(
	equipoID int,
) ([]models.TipoEquipo, error) {
	return s.Repo.ListarPorEquipo(equipoID)
}