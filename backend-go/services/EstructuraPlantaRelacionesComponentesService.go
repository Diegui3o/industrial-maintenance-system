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
	componenteIDs []int,
) error {
	return s.Repo.RelacionarComponentesConEquipo(
		equipoID,
		componenteIDs,
	)
}