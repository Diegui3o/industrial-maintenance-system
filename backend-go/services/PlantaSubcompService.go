package services

import "backend/models"

func (s *EstructuraPlantaService) ListarSubcomponentesParaRelacion(
	componenteID int,
) ([]models.SubcomponenteEquipo, error) {
	return s.Repo.ListarSubcomponentesParaRelacion(componenteID)
}

func (s *EstructuraPlantaService) RelacionarSubcomponentes(
	componenteID int,
	subcomponenteIDs []int,
) error {
	return s.Repo.RelacionarSubcomponentes(
		componenteID,
		subcomponenteIDs,
	)
}