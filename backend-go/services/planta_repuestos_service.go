package services

import "backend/models"

func (s *EstructuraPlantaService) ListarRepuestos() ([]models.Repuesto, error) {
        return s.Repo.ListarRepuestos()
}

func (s *EstructuraPlantaService) CrearRepuesto(
        r *models.Repuesto,
) error {
        return s.Repo.CrearRepuesto(r)
}

func (s *EstructuraPlantaService) AsignarRepuestoComponente(
        componenteID int,
        repuestoID int,
        cantidad float64,
        posicion *string,
        notas *string,
) error {
        return s.Repo.AsignarRepuestoComponente(
                componenteID,
                repuestoID,
                cantidad,
                posicion,
                notas,
        )
}

func (s *EstructuraPlantaService) ActualizarRepuesto(
        id int,
        rep models.Repuesto,
) error {
        return s.Repo.ActualizarRepuesto(id, rep)
}
