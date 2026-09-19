package services

import "backend/models"

func (s *EstructuraPlantaService) ListarSubcomponentes(
        componenteID int,
) ([]models.SubcomponenteEquipo, error) {
        return s.Repo.ListarSubcomponentes(componenteID)
}

func (s *EstructuraPlantaService) CrearSubcomponente(
        item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {
        return s.Repo.CrearSubcomponente(item)
}

func (s *EstructuraPlantaService) ActualizarSubcomponente(
        item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {
        return s.Repo.ActualizarSubcomponente(item)
}

func (s *EstructuraPlantaService) ListarRepuestosSubcomponente(
        subcomponenteID int,
) ([]models.SubcomponenteRepuestoDetalle, error) {
        return s.Repo.ListarRepuestosSubcomponente(subcomponenteID)
}

func (s *EstructuraPlantaService) AsignarRepuestoSubcomponente(
        subcomponenteID int,
        repuestoID int,
        cantidad float64,
        posicion *string,
        notas *string,
) error {
        return s.Repo.AsignarRepuestoSubcomponente(
                subcomponenteID,
                repuestoID,
                cantidad,
                posicion,
                notas,
        )
}
