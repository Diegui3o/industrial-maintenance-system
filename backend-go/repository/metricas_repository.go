package repository

import (
	"database/sql"
)

type MetricaRepository struct {
	DB *sql.DB
}

func (r *MetricaRepository) InsertarMetrica(equipoID int, tipo string, valor float64) error {
	query := `
	INSERT INTO metricas_diarias_detalle (equipo_id, fecha, tipo_metrica, valor)
	VALUES ($1, CURRENT_DATE, $2, $3)
	ON CONFLICT (equipo_id, fecha, tipo_metrica)
	DO UPDATE SET valor = EXCLUDED.valor;
	`

	_, err := r.DB.Exec(query, equipoID, tipo, valor)
	return err
}
