package services

import "backend/models"

func (s *EstructuraPlantaService) ListarComponentesParaRelacionEquipo(
	equipoID int,
) ([]models.ComponenteEquipo, error) {
	return s.Repo.ListarComponentesParaRelacionEquipo(
		equipoID,
	)
}

func (s *EstructuraPlantaService) RelacionarComponentesConEquipo(
	equipoID int,
	relaciones []models.RelacionComponente,
) error {
	return s.Repo.RelacionarComponentesConEquipo(
		equipoID,
		relaciones,
	)
}
