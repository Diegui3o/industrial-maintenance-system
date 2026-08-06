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
