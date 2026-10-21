package repository

import (
	"backend/models"
	"database/sql"
)

func (r *EstructuraPlantaRepository) ListarRepuestos() ([]models.Repuesto, error) {
	rows, err := r.DB.Query(`
        SELECT
            id,
            codigo,
            nombre,
            descripcion,
            activo,
            codigo_sap,
            categoria,
            criticidad,
            stock_actual,
            stock_minimo,
            unidad_medida,
            marca,
            modelo,
            especificaciones_tecnicas
        FROM repuestos
        WHERE activo = TRUE
        ORDER BY nombre
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resultado := make([]models.Repuesto, 0)

	for rows.Next() {
		var rep models.Repuesto

		if err := rows.Scan(
			&rep.ID,
			&rep.Codigo,
			&rep.Nombre,
			&rep.Descripcion,
			&rep.Activo,
			&rep.CodigoSAP,
			&rep.Categoria,
			&rep.Criticidad,
			&rep.StockActual,
			&rep.StockMinimo,
			&rep.UnidadMedida,
			&rep.Marca,
			&rep.Modelo,
			&rep.EspecificacionesTecnicas,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, rep)
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
            activo,
            codigo_sap,
            categoria,
            criticidad,
            stock_actual,
            stock_minimo,
            unidad_medida,
            marca,
            modelo,
            especificaciones_tecnicas
        )
        VALUES (
            $1, $2, $3, TRUE,
            $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        RETURNING id
    `,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
		rep.CodigoSAP,
		rep.Categoria,
		rep.Criticidad,
		rep.StockActual,
		rep.StockMinimo,
		rep.UnidadMedida,
		rep.Marca,
		rep.Modelo,
		rep.EspecificacionesTecnicas,
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
	rep models.RepuestoActualizacion,
) error {
	_, err := r.DB.Exec(`
		UPDATE repuestos
		SET codigo = COALESCE($1, codigo),
		    nombre = COALESCE($2, nombre),
		    descripcion = COALESCE($3, descripcion),
		    activo = COALESCE($4, activo),
		    codigo_sap = COALESCE($5, codigo_sap),
		    categoria = COALESCE($6, categoria),
		    criticidad = COALESCE($7, criticidad),
		    stock_actual = COALESCE($8, stock_actual),
		    stock_minimo = COALESCE($9, stock_minimo),
		    unidad_medida = COALESCE($10, unidad_medida),
		    marca = COALESCE($11, marca),
		    modelo = COALESCE($12, modelo),
		    especificaciones_tecnicas = COALESCE($13, especificaciones_tecnicas),
		    actualizado_en = NOW()
		WHERE id = $14
	`,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
		rep.Activo,
		rep.CodigoSAP,
		rep.Categoria,
		rep.Criticidad,
		rep.StockActual,
		rep.StockMinimo,
		rep.UnidadMedida,
		rep.Marca,
		rep.Modelo,
		rep.EspecificacionesTecnicas,
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
