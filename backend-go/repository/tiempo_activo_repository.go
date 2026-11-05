package repository

import (
	"database/sql"
	"fmt"
	"time"

	"backend/models"
)

type TiempoActivoRepository struct {
	DB *sql.DB
}

func NewTiempoActivoRepository(db *sql.DB) *TiempoActivoRepository {
	return &TiempoActivoRepository{DB: db}
}

// BuscarAbierto devuelve la fila abierta (hasta IS NULL) para
// (tag, activo_tipo, activo_id), si existe.
func (r *TiempoActivoRepository) BuscarAbierto(
	tagID int,
	activoTipo string,
	activoID int,
) (*models.TiempoActivo, error) {
	var t models.TiempoActivo
	var hasta sql.NullTime
	var dur sql.NullInt64
	var motivo sql.NullString
	var vp, vmin, vmax sql.NullFloat64

	err := r.DB.QueryRow(`
        SELECT id, tag_id, COALESCE(activo_tipo, ''),
               COALESCE(activo_id, 0), estado, desde, hasta,
               duracion_segundos, COALESCE(motivo_cierre, ''),
               valor_promedio, valor_min, valor_max
        FROM tiempos_activo_sensor
        WHERE tag_id = $1
          AND COALESCE(activo_tipo, '') = COALESCE($2, '')
          AND COALESCE(activo_id, 0) = COALESCE($3, 0)
          AND hasta IS NULL
        ORDER BY id DESC
        LIMIT 1
    `, tagID, activoTipo, activoID).Scan(
		&t.ID, &t.TagID, &t.ActivoTipo, &t.ActivoID,
		&t.Estado, &t.Desde, &hasta, &dur, &motivo,
		&vp, &vmin, &vmax,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if hasta.Valid {
		t.Hasta = &hasta.Time
	}
	if dur.Valid {
		d := int(dur.Int64)
		t.DuracionSegundos = &d
	}
	t.MotivoCierre = motivo.String
	if vp.Valid {
		t.ValorPromedio = &vp.Float64
	}
	if vmin.Valid {
		t.ValorMin = &vmin.Float64
	}
	if vmax.Valid {
		t.ValorMax = &vmax.Float64
	}
	return &t, nil
}

// CerrarAbierto cierra la fila abierta calculando duración.
func (r *TiempoActivoRepository) CerrarAbierto(
	id int,
	motivo string,
	hasta time.Time,
) error {
	_, err := r.DB.Exec(`
        UPDATE tiempos_activo_sensor
        SET hasta = GREATEST($1, desde),
            duracion_segundos = EXTRACT(EPOCH FROM (GREATEST($1, desde) - desde))::int,
            motivo_cierre = $2
        WHERE id = $3 AND hasta IS NULL
    `, hasta, motivo, id)
	return err
}

// AbrirNuevo inserta una fila abierta.
func (r *TiempoActivoRepository) AbrirNuevo(
	tagID int,
	activoTipo string,
	activoID int,
	estado string,
	desde time.Time,
	valor *float64,
) (int, error) {
	var id int
	err := r.DB.QueryRow(`
        INSERT INTO tiempos_activo_sensor
            (tag_id, activo_tipo, activo_id, estado, desde,
             valor_promedio, valor_min, valor_max)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $6)
        RETURNING id
    `,
		tagID, nullableString(activoTipo), activoID, estado, desde,
		valor,
	).Scan(&id)
	return id, err
}

// CerrarTodosLosAbiertos se llama al arrancar el backend.
func (r *TiempoActivoRepository) CerrarTodosLosAbiertos(
	motivo string,
) (int, error) {
	result, err := r.DB.Exec(`
        UPDATE tiempos_activo_sensor
        SET hasta = NOW(),
            duracion_segundos = EXTRACT(EPOCH FROM (NOW() - desde))::int,
            motivo_cierre = $1
        WHERE hasta IS NULL
    `, motivo)
	if err != nil {
		return 0, err
	}
	filas, _ := result.RowsAffected()
	return int(filas), nil
}

// ListarPorTag devuelve los periodos de un tag solapados con [desde, hasta].
func (r *TiempoActivoRepository) ListarPorTag(
	tagID int,
	desde, hasta time.Time,
) ([]models.TiempoActivo, error) {
	rows, err := r.DB.Query(`
        SELECT id, tag_id, COALESCE(activo_tipo, ''),
               COALESCE(activo_id, 0), estado, desde, hasta,
               duracion_segundos, COALESCE(motivo_cierre, ''),
               valor_promedio, valor_min, valor_max
        FROM tiempos_activo_sensor
        WHERE tag_id = $1
          AND desde < $3
          AND (hasta IS NULL OR hasta > $2)
        ORDER BY desde ASC
    `, tagID, desde, hasta)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.TiempoActivo
	for rows.Next() {
		var t models.TiempoActivo
		var hastaN sql.NullTime
		var dur sql.NullInt64
		var motivo sql.NullString
		var vp, vmin, vmax sql.NullFloat64

		if err := rows.Scan(
			&t.ID, &t.TagID, &t.ActivoTipo, &t.ActivoID,
			&t.Estado, &t.Desde, &hastaN, &dur, &motivo,
			&vp, &vmin, &vmax,
		); err != nil {
			return nil, err
		}
		if hastaN.Valid {
			t.Hasta = &hastaN.Time
		}
		if dur.Valid {
			d := int(dur.Int64)
			t.DuracionSegundos = &d
		}
		t.MotivoCierre = motivo.String
		if vp.Valid {
			t.ValorPromedio = &vp.Float64
		}
		if vmin.Valid {
			t.ValorMin = &vmin.Float64
		}
		if vmax.Valid {
			t.ValorMax = &vmax.Float64
		}
		lista = append(lista, t)
	}
	return lista, rows.Err()
}

// ResumenPorTag devuelve, por guardia, los segundos en cada estado.
func (r *TiempoActivoRepository) ResumenPorTag(
	tagID int,
	desde, hasta time.Time,
) ([]models.ResumenGuardia, error) {
	// Se solapa cada periodo con cada guardia y se agrega.
	rows, err := r.DB.Query(`
        WITH g AS (
            SELECT * FROM guardias_en_rango($1, $2)
        ),
        segmentos AS (
            SELECT
                g.fecha_ref,
                g.tipo,
                g.guardia_inicio,
                g.guardia_fin,
                t.estado,
					EXTRACT(EPOCH FROM (
						LEAST(
							COALESCE(t.hasta, LEAST(NOW(), $2)),
							g.guardia_fin
						)
						- GREATEST(t.desde, g.guardia_inicio)
					))::int AS segundos
            FROM g
            JOIN tiempos_activo_sensor t
                ON t.tag_id = $3
               AND t.desde < g.guardia_fin
               AND (t.hasta IS NULL OR t.hasta > g.guardia_inicio)
        )
        SELECT
            fecha_ref::text AS fecha_ref,
            tipo,
            guardia_inicio,
            guardia_fin,
            COALESCE(SUM(CASE WHEN estado = 'activo'   THEN segundos END), 0) AS activo_seg,
            COALESCE(SUM(CASE WHEN estado = 'inactivo' THEN segundos END), 0) AS inactivo_seg,
            COALESCE(SUM(CASE WHEN estado = 'sin_dato' THEN segundos END), 0) AS sin_dato_seg
        FROM segmentos
        WHERE segundos > 0
        GROUP BY fecha_ref, tipo, guardia_inicio, guardia_fin
        ORDER BY guardia_inicio ASC
    `, desde, hasta, tagID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.ResumenGuardia
	for rows.Next() {
		var g models.ResumenGuardia
		if err := rows.Scan(
			&g.FechaRef, &g.Tipo, &g.GuardiaInicio, &g.GuardiaFin,
			&g.ActivoSegundos, &g.InactivoSegundos, &g.SinDatoSegundos,
		); err != nil {
			return nil, err
		}
		g.TotalSegundos = g.ActivoSegundos + g.InactivoSegundos + g.SinDatoSegundos
		lista = append(lista, g)
	}
	return lista, rows.Err()
}

// ActualizarValoresExtremos actualiza los valores extremos de una fila abierta.
func (r *TiempoActivoRepository) ActualizarValoresExtremos(
	id int,
	valor float64,
) error {
	_, err := r.DB.Exec(`
        UPDATE tiempos_activo_sensor
        SET valor_min = LEAST(COALESCE(valor_min, $1), $1),
            valor_max = GREATEST(COALESCE(valor_max, $1), $1),
            valor_promedio = CASE
                WHEN valor_promedio IS NULL THEN $1
                ELSE (valor_promedio + $1) / 2
            END
        WHERE id = $2 AND hasta IS NULL
    `, valor, id)
	return err
}

// helper para formatear
func formatDuracion(seg int) string {
	h := seg / 3600
	m := (seg % 3600) / 60
	s := seg % 60
	return fmt.Sprintf("%02d:%02d:%02d", h, m, s)
}