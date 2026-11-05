package repository

import (
	"backend/models"
	"database/sql"
)

type EventosRepository struct {
	DB *sql.DB
}

func (r *EventosRepository) CerrarEventoActual(equipoID int) error {

	_, err := r.DB.Exec(`
	UPDATE eventos_estado
	SET fecha_fin = CURRENT_TIMESTAMP
	WHERE equipo_id = $1
	AND fecha_fin IS NULL
	`,
		equipoID)

	return err
}

func (r *EventosRepository) CrearEventoEstado(
	equipoID int,
	estado string,
	motivo string,
) error {

	_, err := r.DB.Exec(`
	INSERT INTO eventos_estado
	(
		equipo_id,
		estado,
		motivo,
		fecha_inicio
	)
	VALUES
	(
		$1,
		$2,
		$3,
		CURRENT_TIMESTAMP
	)
	`,
		equipoID,
		estado,
		motivo,
	)

	return err
}

func (r *EventosRepository) ActualizarEstadoEquipo(
	equipoID int,
	estado string,
) error {

	_, err := r.DB.Exec(`
	UPDATE equipos
	SET estado_equipo = $1,
	actualizado_en = CURRENT_TIMESTAMP
	WHERE id = $2
	`,
		estado,
		equipoID,
	)

	return err
}

func (r *EventosRepository) ObtenerHistorialEquipo(equipoID int) ([]models.EventoEstado, error) {

	rows, err := r.DB.Query(`
	SELECT
		id,
		equipo_id,
		estado,
		motivo,
		fecha_inicio,
		fecha_fin
	FROM eventos_estado
	WHERE equipo_id = $1
	ORDER BY fecha_inicio ASC
	`, equipoID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var lista []models.EventoEstado

	for rows.Next() {

		var evento models.EventoEstado

		err := rows.Scan(
			&evento.ID,
			&evento.EquipoID,
			&evento.Estado,
			&evento.Motivo,
			&evento.FechaInicio,
			&evento.FechaFin,
		)

		if err != nil {
			return nil, err
		}

		lista = append(lista, evento)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *EventosRepository) CambiarEstadoEquipo(
	equipoID int,
	estado string,
	motivo string,
) error {

	tx, err := r.DB.Begin()

	if err != nil {
		return err
	}

	var estadoAnterior string

	err = tx.QueryRow(`
		SELECT estado_equipo
		FROM equipos
		WHERE id = $1
		FOR UPDATE
	`,
		equipoID,
	).Scan(&estadoAnterior)

	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(`
	UPDATE eventos_estado
	SET fecha_fin = CURRENT_TIMESTAMP
	WHERE equipo_id = $1
	AND fecha_fin IS NULL
	`,
		equipoID,
	)

	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(`
	INSERT INTO eventos_estado
	(
		equipo_id,
		estado,
		motivo,
		fecha_inicio
	)
	VALUES
	(
		$1,
		$2,
		$3,
		CURRENT_TIMESTAMP
	)
	`,
		equipoID,
		estado,
		motivo,
	)

	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec(`
	UPDATE equipos
	SET estado_equipo = $1,
	actualizado_en = CURRENT_TIMESTAMP
	WHERE id = $2
	`,
		estado,
		equipoID,
	)
	if estadoAnterior != estado {
		_, err = tx.Exec(`
			INSERT INTO historial_estados_planta (
				entidad_tipo,
				entidad_id,
				estado_anterior,
				estado_nuevo,
				usuario_id,
				motivo
			)
			VALUES (
				'equipo',
				$1,
				$2,
				$3,
				NULL,
				$4
			)
		`,
			equipoID,
			estadoAnterior,
			estado,
			motivo,
		)

		if err != nil {
			tx.Rollback()
			return err
		}
	}
	if err != nil {
		tx.Rollback()
		return err
	}
	var critico bool

	err = tx.QueryRow(`
	SELECT critico
	FROM equipos
	WHERE id = $1
	`,
		equipoID,
	).Scan(&critico)

	if err != nil {
		tx.Rollback()
		return err
	}

	if critico && estado == "fallo" {

		_, err = tx.Exec(`
		INSERT INTO alarmas
		(
			equipo_id,
			tipo,
			mensaje,
			severidad,
			estado
		)
		VALUES
		(
			$1,
			'estado',
			'Equipo en fallo',
			'critica',
			'activa'
		)
		ON CONFLICT DO NOTHING
		`,
			equipoID,
		)

		if err != nil {
			tx.Rollback()
			return err
		}

	}
	return tx.Commit()
}

func (r *EventosRepository) ObtenerEstadoActualEquipo(
	equipoID int,
) (string, error) {

	var estado string

	err := r.DB.QueryRow(`
	SELECT estado_equipo
	FROM equipos
	WHERE id=$1
	`,
		equipoID,
	).Scan(&estado)

	return estado, err
}
// CambiarEstadoActivo es como CambiarEstadoEquipo pero soporta
// componentes y repuestos. No inserta alarma; eso lo hace AlarmaService.
func (r *EventosRepository) CambiarEstadoActivo(
	equipoID int,
	componenteID *int,
	repuestoID *int,
	tagID *int,
	parametro *string,
	estado string,
	motivo string,
) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	// 1. Cerrar evento abierto del activo afectado
	if componenteID != nil && *componenteID > 0 {
		_, err = tx.Exec(`
            UPDATE eventos_estado
            SET fecha_fin = CURRENT_TIMESTAMP
            WHERE componente_id = $1 AND fecha_fin IS NULL
        `, *componenteID)
	} else if repuestoID != nil && *repuestoID > 0 {
		_, err = tx.Exec(`
            UPDATE eventos_estado
            SET fecha_fin = CURRENT_TIMESTAMP
            WHERE repuesto_id = $1 AND fecha_fin IS NULL
        `, *repuestoID)
	} else {
		_, err = tx.Exec(`
            UPDATE eventos_estado
            SET fecha_fin = CURRENT_TIMESTAMP
            WHERE equipo_id = $1 AND fecha_fin IS NULL
        `, equipoID)
	}
	if err != nil {
		tx.Rollback()
		return err
	}

	// 2. Insertar nuevo evento con las columnas del activo
	_, err = tx.Exec(`
        INSERT INTO eventos_estado (
            equipo_id, componente_id, repuesto_id,
            estado, motivo, fecha_inicio
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    `, equipoID, componenteID, repuestoID, estado, motivo)
	if err != nil {
		tx.Rollback()
		return err
	}

	// 3. Actualizar el campo estado del activo afectado
	if componenteID != nil && *componenteID > 0 {
		_, err = tx.Exec(`
            UPDATE componentes_equipo
            SET estado_componente = $1, actualizado_en = CURRENT_TIMESTAMP
            WHERE id = $2
        `, estado, *componenteID)
	} else if repuestoID != nil && *repuestoID > 0 {
		// repuestos usa 'falla' en lugar de 'fallo'
		estadoRepuesto := estado
		if estado == "fallo" {
			estadoRepuesto = "falla"
		}
		_, err = tx.Exec(`
            UPDATE repuestos
            SET estado = $1, actualizado_en = CURRENT_TIMESTAMP
            WHERE id = $2
        `, estadoRepuesto, *repuestoID)
	} else {
		_, err = tx.Exec(`
            UPDATE equipos
            SET estado_equipo = $1, actualizado_en = CURRENT_TIMESTAMP
            WHERE id = $2
        `, estado, equipoID)
	}
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}