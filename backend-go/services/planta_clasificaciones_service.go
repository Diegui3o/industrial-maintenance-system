package services

import "backend/models"

func (s *EstructuraPlantaService) ListarClasificaciones() ([]models.ClasificacionPlanta, error) {
        return s.Repo.ListarClasificaciones()
}

func (s *EstructuraPlantaService) CrearClasificacion(
        c *models.ClasificacionPlanta,
) error {
        return s.Repo.CrearClasificacion(c)
}

func (s *EstructuraPlantaService) AsignarClasificacion(
        equipoID int,
        clasificacionID int,
) error {
        return s.Repo.AsignarClasificacion(equipoID, clasificacionID)
}

func (s *EstructuraPlantaService) ActualizarClasificacion(
        id int,
        c models.ClasificacionPlanta,
) error {
        return s.Repo.ActualizarClasificacion(id, c)
}

func (s *EstructuraPlantaService) ActualizarEquipoClasificaciones(
        equipoID int,
        clasificaciones []int,
) error {
        return s.Repo.ActualizarEquipoClasificaciones(
                equipoID,
                clasificaciones,
        )
}

func (s *EstructuraPlantaService) ListarClasificacionesPorEquipo(
        equipoID int,
) ([]models.ClasificacionPlanta, error) {
        return s.Repo.ListarClasificacionesPorEquipo(equipoID)
}
