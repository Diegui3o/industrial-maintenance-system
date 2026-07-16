package models

import "time"

type DatoSensor struct {
	ID         int       `json:"id"`
	EquipoID   int       `json:"equipo_id"`
	Parametro  string    `json:"parametro"`
	Valor      float64   `json:"valor"`
	Unidad     string    `json:"unidad"`
	Fuente     string    `json:"fuente"`
	RecibidoEn time.Time `json:"recibido_en"`
}
