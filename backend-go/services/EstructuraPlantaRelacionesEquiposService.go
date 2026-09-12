package services

import "backend/models"

func (s *EstructuraPlantaService) ListarEquiposParaRelacionSubproceso(
	subprocesoID int,
) ([]models.Equipo, error) {
	return s.Repo.ListarEquiposParaRelacionSubproceso(
		subprocesoID,
	)
}

func (s *EstructuraPlantaService) RelacionarEquiposConSubproceso(
	subprocesoID int,
	equipoIDs []int,
) error {
	return s.Repo.RelacionarEquiposConSubproceso(
		subprocesoID,
		equipoIDs,
	)
}