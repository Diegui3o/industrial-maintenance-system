package services

import "backend/models"

func (s *EstructuraPlantaService) ListarTodosSubprocesosPlanta() ([]models.SubprocesoPlanta, error) {
	return s.Repo.ListarTodosSubprocesosPlanta()
}

func (s *EstructuraPlantaService) RelacionarSubprocesosConProceso(
	procesoID int,
	subprocesoIDs []int,
) error {
	return s.Repo.RelacionarSubprocesosConProceso(
		procesoID,
		subprocesoIDs,
	)
}