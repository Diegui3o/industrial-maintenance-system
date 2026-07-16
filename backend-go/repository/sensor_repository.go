package repository

import (
	"backend/models"
	"database/sql"
)

type SensorRepository struct {
	DB *sql.DB
}

func NewSensorRepository(db *sql.DB) *SensorRepository {
	return &SensorRepository{DB: db}
}

func (r *SensorRepository) GuardarDato(equipoID int, parametro string, valor float64, unidad, fuente string) error {
	_, err := r.DB.Exec(`
        INSERT INTO datos_sensores (equipo_id, parametro, valor, unidad, fuente)
        VALUES ($1, $2, $3, $4, $5)
    `, equipoID, parametro, valor, unidad, fuente)
	return err
}

func (r *SensorRepository) ObtenerUltimosDatos(equipoID int, limite int) ([]models.DatoSensor, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, parametro, valor, unidad, fuente, recibido_en
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
		if err := rows.Scan(&d.ID, &d.EquipoID, &d.Parametro, &d.Valor, &d.Unidad, &d.Fuente, &d.RecibidoEn); err != nil {
			return nil, err
		}
		datos = append(datos, d)
	}
	return datos, rows.Err()
}
