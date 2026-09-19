package services

import "backend/models"

func (s *EstructuraPlantaService) ListarSubprocesos(
        procesoID int,
) ([]models.SubprocesoPlanta, error) {
        return s.Repo.ListarSubprocesos(procesoID)
}

func (s *EstructuraPlantaService) CrearSubproceso(
        sbp *models.SubprocesoPlanta,
) error {
        return s.Repo.CrearSubproceso(sbp)
}

func (s *EstructuraPlantaService) ActualizarSubproceso(
        id int,
        sbp models.SubprocesoPlanta,
) error {
        return s.Repo.ActualizarSubproceso(id, sbp)
}
