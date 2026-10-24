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
    rep models.RepuestoActualizacion,
    tipoOrigen string,
    usuarioID *int,
    conectorID *string,
    comentario *string,
) error {
    return s.Repo.ActualizarRepuesto(id, rep, tipoOrigen, usuarioID, conectorID, comentario)
}

func (s *EstructuraPlantaService) EliminarRepuestoSeguro(id int) error {
    return s.Repo.EliminarRepuestoSeguro(id)
}

func (s *EstructuraPlantaService) AgregarCompatibilidadEquipo(repuestoID, equipoID int) error {
    return s.Repo.AgregarCompatibilidadEquipo(repuestoID, equipoID)
}

func (s *EstructuraPlantaService) ListarEquiposCompatibles(repuestoID int) ([]int, error) {
    return s.Repo.ListarEquiposCompatibles(repuestoID)
}

func (s *EstructuraPlantaService) EliminarCompatibilidadEquipo(repuestoID, equipoID int) error {
    return s.Repo.EliminarCompatibilidadEquipo(repuestoID, equipoID)
}

func (s *EstructuraPlantaService) ListarHistorialRepuesto(repuestoID int) ([]models.RepuestoHistorial, error) {
    return s.Repo.ListarHistorialRepuesto(repuestoID)
}