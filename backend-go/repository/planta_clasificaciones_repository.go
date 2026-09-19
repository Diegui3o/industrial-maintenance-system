package repository

import (
	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarClasificaciones() ([]models.ClasificacionPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, activo
		FROM clasificaciones_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ClasificacionPlanta

	for rows.Next() {
		var c models.ClasificacionPlanta

		if err := rows.Scan(
			&c.ID,
			&c.Nombre,
			&c.Descripcion,
			&c.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, c)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearClasificacion(
	c *models.ClasificacionPlanta,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO clasificaciones_planta (
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, TRUE)
		RETURNING id
	`,
		c.Nombre,
		c.Descripcion,
	).Scan(&c.ID)

	if err != nil {
		return err
	}

	c.Activo = true

	return nil
}

func (r *EstructuraPlantaRepository) AsignarClasificacion(
	equipoID int,
	clasificacionID int,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO equipo_clasificacion_planta (
			equipo_id,
			clasificacion_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id, clasificacion_id)
		DO NOTHING
	`,
		equipoID,
		clasificacionID,
	)

	return err
}

// ==================== SISTEMAS ====================

func (r *EstructuraPlantaRepository) ActualizarClasificacion(
	id int,
	c models.ClasificacionPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE clasificaciones_planta
		SET nombre = $1,
		    descripcion = $2,
		    activo = $3,
		    actualizado_en = NOW()
		WHERE id = $4
	`,
		c.Nombre,
		c.Descripcion,
		c.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarEquipoClasificaciones(
	equipoID int,
	clasificaciones []int,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		DELETE FROM equipo_clasificacion_planta
		WHERE equipo_id = $1
	`, equipoID)

	if err != nil {
		return err
	}

	for _, clasificacionID := range clasificaciones {
		_, err = tx.Exec(`
			INSERT INTO equipo_clasificacion_planta (
				equipo_id,
				clasificacion_id
			)
			VALUES ($1, $2)
		`,
			equipoID,
			clasificacionID,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *EstructuraPlantaRepository) ListarClasificacionesPorEquipo(
	equipoID int,
) ([]models.ClasificacionPlanta, error) {

	rows, err := r.DB.Query(`
		SELECT
			c.id,
			c.nombre,
			c.descripcion,
			c.activo
		FROM clasificaciones_planta c
		INNER JOIN equipo_clasificacion_planta ec
			ON ec.clasificacion_id = c.id
		WHERE ec.equipo_id = $1
		ORDER BY c.nombre
	`, equipoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.ClasificacionPlanta

	for rows.Next() {
		var c models.ClasificacionPlanta

		if err := rows.Scan(
			&c.ID,
			&c.Nombre,
			&c.Descripcion,
			&c.Activo,
		); err != nil {
			return nil, err
		}

		lista = append(lista, c)
	}

	return lista, rows.Err()
}
