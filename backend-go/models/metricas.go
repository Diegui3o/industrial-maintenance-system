package models

import "time"

type MetricaDetalle struct {
	ID          int       `json:"id"`
	EquipoID    int       `json:"equipo_id"`
	Fecha       time.Time `json:"fecha"`
	TipoMetrica string    `json:"tipo_metrica"`
	Valor       float64   `json:"valor"`
}