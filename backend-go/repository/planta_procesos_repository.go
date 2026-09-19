package repository

import (
	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarProcesos() ([]models.ProcesoPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, activo
		FROM procesos_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ProcesoPlanta

	for rows.Next() {
		var p models.ProcesoPlanta

		if err := rows.Scan(
			&p.ID,
			&p.Nombre,
			&p.Descripcion,
			&p.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, p)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearProceso(
	p *models.ProcesoPlanta,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO procesos_planta (
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, TRUE)
		RETURNING id
	`,
		p.Nombre,
		p.Descripcion,
	).Scan(&p.ID)

	if err != nil {
		return err
	}

	p.Activo = true

	return nil
}

// ==================== SUBPROCESOS ====================

func (r *EstructuraPlantaRepository) ActualizarProceso(
	id int,
	p models.ProcesoPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE procesos_planta
		SET nombre = $1,
		    descripcion = $2,
		    activo = $3,
		    actualizado_en = NOW()
		WHERE id = $4
	`,
		p.Nombre,
		p.Descripcion,
		p.Activo,
		id,
	)

	return err
}
