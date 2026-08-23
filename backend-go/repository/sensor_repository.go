package repository

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"backend/models"
)

type SensorRepository struct {
	DB *sql.DB
}

func NewSensorRepository(db *sql.DB) *SensorRepository {
	return &SensorRepository{DB: db}
}

func (r *SensorRepository) GuardarDato(
	equipoID int,
	parametro string,
	valor float64,
	unidad string,
	fuente string,
	calidad string,
	timestampOriginal time.Time,
) error {

	if equipoID <= 0 {
		return fmt.Errorf(
			"no se puede guardar dato sin equipo: parametro=%s",
			parametro,
		)
	}

	if parametro == "" {
		return fmt.Errorf("no se puede guardar dato sin parametro")
	}

	var existe bool

	err := r.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM equipos WHERE id = $1)",
		equipoID,
	).Scan(&existe)

	if err != nil {
		return fmt.Errorf(
			"error verificando equipo %d: %w",
			equipoID,
			err,
		)
	}

	if !existe {
		return fmt.Errorf(
			"equipo %d no existe",
			equipoID,
		)
	}

	_, err = r.DB.Exec(`
		INSERT INTO datos_sensores (
			equipo_id,
			parametro,
			valor,
			unidad,
			fuente,
			calidad,
			recibido_en
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			COALESCE($7, NOW())
		)
	`,
		equipoID,
		parametro,
		valor,
		unidad,
		fuente,
		calidad,
		timestampOriginal,
	)

	if err != nil {
		return fmt.Errorf(
			"error guardando dato: %w",
			err,
		)
	}

	_, err = r.DB.Exec(`
		UPDATE pi_tags
		SET
			ultima_actualizacion = NOW(),
			ultimo_valor = $5,
			unidad = $3,
			fuente = $4,
			activo = true
		WHERE tag_name = $1
		AND equipment_id = $2
	`,
		parametro,
		equipoID,
		unidad,
		fuente,
		valor,
	)

	if err != nil {
		log.Printf(
			"⚠️ Error actualizando pi_tags: Equipo=%d | Tag=%s | Error=%v",
			equipoID,
			parametro,
			err,
		)
	}
	if equipoID > 0 && parametro != "" {

		_, err = r.DB.Exec(`
		UPDATE pi_tags
		SET
			ultima_actualizacion = NOW(),
			ultimo_valor = $3,
			unidad = $4,
			fuente = $5,
			activo = true
		WHERE tag_name = $1
		  AND equipment_id = $2
	`,
			parametro,
			equipoID,
			valor,
			unidad,
			fuente,
		)

		if err != nil {
			log.Printf(
				"⚠️ Error actualizando pi_tags: Equipo=%d | Tag=%s | Error=%v",
				equipoID,
				parametro,
				err,
			)
		}
	}
	log.Printf(
		"💾 Dato guardado: Equipo=%d | Tag=%s | Valor=%.3f | Unidad=%s | Fuente=%s",
		equipoID,
		parametro,
		valor,
		unidad,
		fuente,
	)

	return nil
}

// ObtenerUltimosDatos - Obtiene los últimos N datos de un equipo
func (r *SensorRepository) ObtenerUltimosDatos(equipoID int, limite int) ([]models.DatoSensor, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, parametro, valor, unidad, fuente, calidad, recibido_en
        FROM datos_sensores
        WHERE equipo_id = $1
        ORDER BY recibido_en DESC
        LIMIT $2
    `, equipoID, limite)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var datos []models.DatoSensor
	for rows.Next() {
		var d models.DatoSensor
		if err := rows.Scan(&d.ID, &d.EquipoID, &d.Parametro, &d.Valor, &d.Unidad, &d.Fuente, &d.Calidad, &d.RecibidoEn); err != nil {
			return nil, err
		}
		datos = append(datos, d)
	}
	return datos, rows.Err()
}

// ObtenerUltimoValor - Obtiene el último valor de un tag específico
func (r *SensorRepository) ObtenerUltimoValor(equipoID int, parametro string) (*models.UltimoValorSensor, error) {
	var u models.UltimoValorSensor
	err := r.DB.QueryRow(`
		SELECT id, equipo_id, parametro, valor, unidad, fuente, calidad, timestamp_original, actualizado_en
		FROM ultimo_valor_sensor
		WHERE equipo_id = $1 AND parametro = $2
	`, equipoID, parametro).Scan(
		&u.ID, &u.EquipoID, &u.Parametro, &u.Valor, &u.Unidad, &u.Fuente, &u.Calidad,
		&u.TimestampOriginal, &u.ActualizadoEn,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &u, err
}

// ObtenerTodosUltimosValores - Obtiene todos los últimos valores de un equipo
func (r *SensorRepository) ObtenerTodosUltimosValores(equipoID int) ([]models.UltimoValorSensor, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, parametro, valor, unidad, fuente, calidad, timestamp_original, actualizado_en
        FROM ultimo_valor_sensor
        WHERE equipo_id = $1
        ORDER BY parametro
    `, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var valores []models.UltimoValorSensor
	for rows.Next() {
		var u models.UltimoValorSensor
		if err := rows.Scan(&u.ID, &u.EquipoID, &u.Parametro, &u.Valor, &u.Unidad, &u.Fuente, &u.Calidad, &u.TimestampOriginal, &u.ActualizadoEn); err != nil {
			return nil, err
		}
		valores = append(valores, u)
	}
	return valores, rows.Err()
}

// ObtenerHistoricoTag - Obtiene datos históricos de un tag en un rango de tiempo
func (r *SensorRepository) ObtenerHistoricoTag(
	equipoID int,
	parametro string,
	desde time.Time,
	hasta time.Time,
) ([]models.DatoSensor, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, parametro, valor, unidad, fuente, calidad, recibido_en
        FROM datos_sensores
        WHERE equipo_id = $1 AND parametro = $2 
            AND recibido_en >= $3 AND recibido_en <= $4
        ORDER BY recibido_en ASC
    `, equipoID, parametro, desde, hasta)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var datos []models.DatoSensor
	for rows.Next() {
		var d models.DatoSensor
		if err := rows.Scan(&d.ID, &d.EquipoID, &d.Parametro, &d.Valor, &d.Unidad, &d.Fuente, &d.Calidad, &d.RecibidoEn); err != nil {
			return nil, err
		}
		datos = append(datos, d)
	}
	return datos, rows.Err()
}

func (r *SensorRepository) ActualizarUltimoValor(
	equipoID int,
	parametro string,
	valor float64,
	unidad string,
	fuente string,
	calidad string,
	timestamp time.Time,
) error {
	// SIEMPRE actualizar el último valor
	_, err := r.DB.Exec(`
		INSERT INTO ultimo_valor_sensor (
			equipo_id, 
			parametro, 
			valor, 
			unidad, 
			fuente, 
			calidad, 
			timestamp_original, 
			actualizado_en
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (equipo_id, parametro) 
		DO UPDATE SET
			valor = EXCLUDED.valor,
			unidad = EXCLUDED.unidad,
			fuente = EXCLUDED.fuente,
			calidad = EXCLUDED.calidad,
			timestamp_original = EXCLUDED.timestamp_original,
			actualizado_en = EXCLUDED.actualizado_en
	`, equipoID, parametro, valor, unidad, fuente, calidad, timestamp, time.Now())

	if err != nil {
		log.Printf("❌ Error actualizando último valor: %v", err)
		return err
	}

	log.Printf("✅ Último valor actualizado: Equipo=%d, %s=%.3f %s",
		equipoID, parametro, valor, unidad)

	return nil
}
