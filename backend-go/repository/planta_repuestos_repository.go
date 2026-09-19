package repository

import (
	"backend/models"
	"database/sql"
)

func (r *EstructuraPlantaRepository) ListarRepuestos() ([]models.Repuesto, error) {
	rows, err := r.DB.Query(`
		SELECT id, codigo, nombre, descripcion, activo
		FROM repuestos
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.Repuesto

	for rows.Next() {
		var r models.Repuesto

		if err := rows.Scan(
			&r.ID,
			&r.Codigo,
			&r.Nombre,
			&r.Descripcion,
			&r.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, r)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearRepuesto(
	rep *models.Repuesto,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO repuestos (
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, TRUE)
		RETURNING id
	`,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
	).Scan(&rep.ID)

	if err != nil {
		return err
	}

	rep.Activo = true

	return nil
}

func (r *EstructuraPlantaRepository) AsignarRepuestoComponente(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO componente_repuesto (
			componente_id,
			repuesto_id,
			cantidad,
			posicion,
			notas
		)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (componente_id, repuesto_id)
		DO UPDATE SET
			cantidad = EXCLUDED.cantidad,
			posicion = EXCLUDED.posicion,
			notas = EXCLUDED.notas,
			actualizado_en = NOW()
	`,
		componenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)

	return err
}

// ==================== ACTUALIZACIONES ====================

func (r *EstructuraPlantaRepository) ActualizarRepuesto(
	id int,
	rep models.Repuesto,
) error {
	_, err := r.DB.Exec(`
		UPDATE repuestos
		SET codigo = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
		rep.Activo,
		id,
	)

	return err
}

// ==================== ACTUALIZAR RELACIONES ====================

func (r *EstructuraPlantaRepository) ActualizarComponenteRepuestos(
	componenteID int,
	repuestos []int,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		DELETE FROM componente_repuesto
		WHERE componente_id = $1
	`, componenteID)

	if err != nil {
		return err
	}

	for _, repuestoID := range repuestos {
		_, err = tx.Exec(`
			INSERT INTO componente_repuesto (
				componente_id,
				repuesto_id
			)
			VALUES ($1, $2)
		`,
			componenteID,
			repuestoID,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// ==================== CONSULTAR RELACIONES ====================

func (r *EstructuraPlantaRepository) ListarRepuestosPorComponente(
	componenteID int,
) ([]models.Repuesto, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			r.descripcion,
			r.activo
		FROM repuestos r
		INNER JOIN componente_repuesto cr
			ON cr.repuesto_id = r.id
		WHERE cr.componente_id = $1
		ORDER BY r.nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Repuesto

	for rows.Next() {
		var rep models.Repuesto

		if err := rows.Scan(
			&rep.ID,
			&rep.Codigo,
			&rep.Nombre,
			&rep.Descripcion,
			&rep.Activo,
		); err != nil {
			return nil, err
		}

		lista = append(lista, rep)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarRepuestosDetallePorComponente(
	componenteID int,
) ([]models.ComponenteRepuestoDetalle, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			cr.cantidad,
			cr.posicion,
			cr.notas
		FROM componente_repuesto cr
		INNER JOIN repuestos r
			ON r.id = cr.repuesto_id
		WHERE cr.componente_id = $1
		ORDER BY r.nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.ComponenteRepuestoDetalle

	for rows.Next() {
		var item models.ComponenteRepuestoDetalle
		var codigo sql.NullString
		var posicion sql.NullString
		var notas sql.NullString

		err := rows.Scan(
			&item.RepuestoID,
			&codigo,
			&item.Nombre,
			&item.Cantidad,
			&posicion,
			&notas,
		)

		if err != nil {
			return nil, err
		}

		if codigo.Valid {
			item.Codigo = &codigo.String
		}

		if posicion.Valid {
			item.Posicion = &posicion.String
		}

		if notas.Valid {
			item.Notas = &notas.String
		}

		lista = append(lista, item)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ActualizarComponenteRepuesto(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {

	_, err := r.DB.Exec(`
		UPDATE componente_repuesto
		SET
			cantidad = $1,
			posicion = $2,
			notas = $3,
			actualizado_en = NOW()
		WHERE componente_id = $4
		  AND repuesto_id = $5
	`,
		cantidad,
		posicion,
		notas,
		componenteID,
		repuestoID,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarAsignacionRepuesto(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	_, err := r.DB.Exec(`
		UPDATE componente_repuesto
		SET
			cantidad = $1,
			posicion = $2,
			notas = $3,
			actualizado_en = NOW()
		WHERE componente_id = $4
		  AND repuesto_id = $5
	`,
		cantidad,
		posicion,
		notas,
		componenteID,
		repuestoID,
	)

	return err
}
