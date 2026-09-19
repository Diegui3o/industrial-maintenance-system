package repository

import (
	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarSubprocesos(procesoID int) ([]models.SubprocesoPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, proceso_id, nombre, descripcion, activo
		FROM subprocesos_planta
		WHERE proceso_id = $1
		  AND activo = TRUE
		ORDER BY nombre
	`, procesoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubprocesoPlanta

	for rows.Next() {
		var s models.SubprocesoPlanta

		if err := rows.Scan(
			&s.ID,
			&s.ProcesoID,
			&s.Nombre,
			&s.Descripcion,
			&s.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, s)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearSubproceso(s *models.SubprocesoPlanta) error {
	err := r.DB.QueryRow(`
		INSERT INTO subprocesos_planta (
			proceso_id,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, TRUE)
		RETURNING id
	`,
		s.ProcesoID,
		s.Nombre,
		s.Descripcion,
	).Scan(&s.ID)

	if err != nil {
		return err
	}

	s.Activo = true

	return nil
}

// ==================== EQUIPO Ã¢â€ â€™ SUBPROCESO ====================

func (r *EstructuraPlantaRepository) ActualizarSubproceso(
	id int,
	s models.SubprocesoPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE subprocesos_planta
		SET proceso_id = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		s.ProcesoID,
		s.Nombre,
		s.Descripcion,
		s.Activo,
		id,
	)

	return err
}
