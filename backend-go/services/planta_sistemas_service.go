package services

import "backend/models"

func (s *EstructuraPlantaService) ListarSistemas() ([]models.SistemaPlanta, error) {
        return s.Repo.ListarSistemas()
}

func (s *EstructuraPlantaService) CrearSistema(
        sistema *models.SistemaPlanta,
) error {
        return s.Repo.CrearSistema(sistema)
}

func (s *EstructuraPlantaService) AsignarSistema(
        equipoID int,
        sistemaID int,
) error {
        return s.Repo.AsignarSistema(equipoID, sistemaID)
}

func (s *EstructuraPlantaService) ActualizarSistema(
        id int,
        sistema models.SistemaPlanta,
) error {
        return s.Repo.ActualizarSistema(id, sistema)
}

func (s *EstructuraPlantaService) ActualizarEquipoSistemas(
        equipoID int,
        sistemas []int,
) error {
        return s.Repo.ActualizarEquipoSistemas(
                equipoID,
                sistemas,
        )
}

func (s *EstructuraPlantaService) ListarSistemasPorEquipo(
        equipoID int,
) ([]models.SistemaPlanta, error) {
        return s.Repo.ListarSistemasPorEquipo(equipoID)
}

func (s *EstructuraPlantaService) ListarSubprocesosSistema(
        sistemaID int,
) ([]models.SubprocesoSistemaPlanta, error) {
        return s.Repo.ListarSubprocesosSistema(sistemaID)
}

func (s *EstructuraPlantaService) CrearSubprocesoSistema(
        item models.SubprocesoSistemaPlanta,
) (models.SubprocesoSistemaPlanta, error) {
        return s.Repo.CrearSubprocesoSistema(item)
}

func (s *EstructuraPlantaService) ActualizarSubprocesoSistema(
        item models.SubprocesoSistemaPlanta,
) (models.SubprocesoSistemaPlanta, error) {
        return s.Repo.ActualizarSubprocesoSistema(item)
}
