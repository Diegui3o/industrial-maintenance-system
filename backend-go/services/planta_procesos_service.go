package services

import "backend/models"

func (s *EstructuraPlantaService) ListarProcesos() ([]models.ProcesoPlanta, error) {
        return s.Repo.ListarProcesos()
}

func (s *EstructuraPlantaService) CrearProceso(p *models.ProcesoPlanta) error {
        return s.Repo.CrearProceso(p)
}

func (s *EstructuraPlantaService) ActualizarProceso(
        id int,
        p models.ProcesoPlanta,
) error {
        return s.Repo.ActualizarProceso(id, p)
}
