package repository

import (
	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarComponentes(
	equipoID int,
) ([]models.ComponenteEquipo, error) {
	rows, err := r.DB.Query(`
		SELECT id, equipo_id, codigo, nombre, descripcion, activo
		FROM componentes_equipo
		WHERE equipo_id = $1
		  AND activo = TRUE
		ORDER BY nombre
	`, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ComponenteEquipo

	for rows.Next() {
		var c models.ComponenteEquipo

		if err := rows.Scan(
			&c.ID,
			&c.EquipoID,
			&c.Codigo,
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

func (r *EstructuraPlantaRepository) CrearComponente(
	c *models.ComponenteEquipo,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO componentes_equipo (
			equipo_id,
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4, TRUE)
		RETURNING id
	`,
		c.EquipoID,
		c.Codigo,
		c.Nombre,
		c.Descripcion,
	).Scan(&c.ID)

	if err != nil {
		return err
	}

	c.Activo = true

	return nil
}

// ==================== REPUESTOS ====================

func (r *EstructuraPlantaRepository) ActualizarComponente(
	id int,
	c models.ComponenteEquipo,
) error {
	_, err := r.DB.Exec(`
		UPDATE componentes_equipo
		SET codigo = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		c.Codigo,
		c.Nombre,
		c.Descripcion,
		c.Activo,
		id,
	)

	return err
}
