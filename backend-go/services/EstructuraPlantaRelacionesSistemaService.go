package services

import "backend/models"

func (s *EstructuraPlantaService) ListarTodosSubprocesosSistemaPlanta() ([]models.SubprocesoSistemaPlanta, error) {
	return s.Repo.ListarTodosSubprocesosSistemaPlanta()
}

func (s *EstructuraPlantaService) RelacionarSubprocesosConSistema(
	sistemaID int,
	subprocesoIDs []int,
) error {
	return s.Repo.RelacionarSubprocesosConSistema(
		sistemaID,
		subprocesoIDs,
	)
}