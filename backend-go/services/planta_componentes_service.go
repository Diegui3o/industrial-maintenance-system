package services

import "backend/models"

func (s *EstructuraPlantaService) ListarComponentes(
        equipoID int,
) ([]models.ComponenteEquipo, error) {
        return s.Repo.ListarComponentes(equipoID)
}

func (s *EstructuraPlantaService) CrearComponente(
        c *models.ComponenteEquipo,
) error {
        return s.Repo.CrearComponente(c)
}

func (s *EstructuraPlantaService) ActualizarComponente(
        id int,
        c models.ComponenteEquipo,
) error {
        return s.Repo.ActualizarComponente(id, c)
}

func (s *EstructuraPlantaService) ActualizarComponenteRepuestos(
        componenteID int,
        repuestos []int,
) error {
        return s.Repo.ActualizarComponenteRepuestos(
                componenteID,
                repuestos,
        )
}

func (s *EstructuraPlantaService) ListarRepuestosPorComponente(
        componenteID int,
) ([]models.Repuesto, error) {
        return s.Repo.ListarRepuestosPorComponente(componenteID)
}

func (s *EstructuraPlantaService) ObtenerEquipoPlantaDetalle(
        equipoID int,
) (*models.EquipoPlantaDetalle, error) {
        return s.Repo.ObtenerEquipoPlantaDetalle(equipoID)
}

func (s *EstructuraPlantaService) ListarRepuestosDetallePorComponente(
        componenteID int,
) ([]models.ComponenteRepuestoDetalle, error) {
        return s.Repo.ListarRepuestosDetallePorComponente(componenteID)
}

func (s *EstructuraPlantaService) ActualizarComponenteRepuesto(
        componenteID int,
        repuestoID int,
        cantidad float64,
        posicion *string,
        notas *string,
) error {
        return s.Repo.ActualizarComponenteRepuesto(
                componenteID,
                repuestoID,
                cantidad,
                posicion,
                notas,
        )
}
