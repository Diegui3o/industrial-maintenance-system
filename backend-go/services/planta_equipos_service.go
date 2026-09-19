package services

import "backend/models"

func (s *EstructuraPlantaService) AsignarEquipoSubproceso(
        equipoID int,
        subprocesoID int,
) error {
        return s.Repo.AsignarEquipoSubproceso(equipoID, subprocesoID)
}

func (s *EstructuraPlantaService) ObtenerSubprocesoEquipo(
        equipoID int,
) (*models.PlantaEquipo, error) {
        return s.Repo.ObtenerSubprocesoEquipo(equipoID)
}

func (s *EstructuraPlantaService) ActualizarEquipoSubproceso(
        equipoID int,
        subprocesoID int,
) error {
        return s.Repo.ActualizarEquipoSubproceso(
                equipoID,
                subprocesoID,
        )
}

func (s *EstructuraPlantaService) ListarEquiposPorSubproceso(
        subprocesoID int,
) ([]models.PlantaEquipo, error) {
        return s.Repo.ListarEquiposPorSubproceso(subprocesoID)
}

func (s *EstructuraPlantaService) ListarEquiposSinUbicar() ([]models.Equipo, error) {
        return s.Repo.ListarEquiposSinUbicar()
}

func (s *EstructuraPlantaService) ListarEquiposDisponiblesSistema() ([]models.Equipo, error) {
        return s.Repo.ListarEquiposDisponiblesSistema()
}

func (s *EstructuraPlantaService) ListarEquiposPorSubprocesoSistema(
        subprocesoSistemaID int,
) ([]models.Equipo, error) {
        return s.Repo.ListarEquiposPorSubprocesoSistema(
                subprocesoSistemaID,
        )
}

func (s *EstructuraPlantaService) AsignarEquipoSubprocesoSistema(
        equipoID int,
        subprocesoSistemaID int,
) error {
        return s.Repo.AsignarEquipoSubprocesoSistema(
                equipoID,
                subprocesoSistemaID,
        )
}
