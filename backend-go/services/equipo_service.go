package services

import (
	"backend/models"
	"backend/repository"
)

type EquipoService struct {
	Repo *repository.EquipoRepository
}

func (s *EquipoService) ListarEquipos(
	filtros map[string]string,
	page int,
	limit int,
	sort string,
	order string,
) ([]models.Equipo, error) {

	return s.Repo.ObtenerEquipos(
		filtros,
		page,
		limit,
		sort,
		order,
	)
}

func (s *EquipoService) CrearEquipos(
	e models.Equipo,
) error {

	return s.Repo.CrearEquipos(e)

}

func (s *EquipoService) BuscarEquipoPorID(
	id int,
) (*models.Equipo, error) {

	return s.Repo.ObtenerEquipoPorID(id)

}

func (s *EquipoService) ActualizarEquipo(
	id int,
	e models.Equipo,
) error {

	return s.Repo.ActualizarEquipo(id, e)

}
