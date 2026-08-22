package models

import "time"

type UltimoValorSensor struct {
	ID                int       `json:"id"`
	EquipoID          int       `json:"equipo_id"`
	Parametro         string    `json:"parametro"`
	Valor             float64   `json:"valor"`
	Unidad            string    `json:"unidad"`
	Fuente            string    `json:"fuente"`
	Calidad           string    `json:"calidad"`
	TimestampOriginal time.Time `json:"timestamp_original"`
	ActualizadoEn     time.Time `json:"actualizado_en"`
}
