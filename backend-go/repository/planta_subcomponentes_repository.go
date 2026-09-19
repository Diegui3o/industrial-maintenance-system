package repository

import (
	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarSubcomponentes(
	componenteID int,
) ([]models.SubcomponenteEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM subcomponentes_equipo
		WHERE componente_id = $1
		ORDER BY nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubcomponenteEquipo

	for rows.Next() {
		var item models.SubcomponenteEquipo

		if err := rows.Scan(
			&item.ID,
			&item.ComponenteID,
			&item.Codigo,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) CrearSubcomponente(
	item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {

	err := r.DB.QueryRow(`
		INSERT INTO subcomponentes_equipo (
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4, TRUE)
		RETURNING
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
	`,
		item.ComponenteID,
		item.Codigo,
		item.Nombre,
		item.Descripcion,
	).Scan(
		&item.ID,
		&item.ComponenteID,
		&item.Codigo,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}

func (r *EstructuraPlantaRepository) ActualizarSubcomponente(
	item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {

	err := r.DB.QueryRow(`
		UPDATE subcomponentes_equipo
		SET
			componente_id = $1,
			codigo = $2,
			nombre = $3,
			descripcion = $4,
			activo = $5,
			actualizado_en = NOW()
		WHERE id = $6
		RETURNING
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
	`,
		item.ComponenteID,
		item.Codigo,
		item.Nombre,
		item.Descripcion,
		item.Activo,
		item.ID,
	).Scan(
		&item.ID,
		&item.ComponenteID,
		&item.Codigo,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}

func (r *EstructuraPlantaRepository) ListarRepuestosSubcomponente(
	subcomponenteID int,
) ([]models.SubcomponenteRepuestoDetalle, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			sr.cantidad,
			sr.posicion,
			sr.notas
		FROM subcomponente_repuesto sr
		INNER JOIN repuestos r
			ON r.id = sr.repuesto_id
		WHERE sr.subcomponente_id = $1
		ORDER BY r.nombre
	`, subcomponenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubcomponenteRepuestoDetalle

	for rows.Next() {
		var item models.SubcomponenteRepuestoDetalle

		if err := rows.Scan(
			&item.RepuestoID,
			&item.Codigo,
			&item.Nombre,
			&item.Cantidad,
			&item.Posicion,
			&item.Notas,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) AsignarRepuestoSubcomponente(
	subcomponenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {

	_, err := r.DB.Exec(`
		INSERT INTO subcomponente_repuesto (
			subcomponente_id,
			repuesto_id,
			cantidad,
			posicion,
			notas
		)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (subcomponente_id, repuesto_id)
		DO UPDATE SET
			cantidad = EXCLUDED.cantidad,
			posicion = EXCLUDED.posicion,
			notas = EXCLUDED.notas,
			actualizado_en = NOW()
	`,
		subcomponenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)

	return err
}
