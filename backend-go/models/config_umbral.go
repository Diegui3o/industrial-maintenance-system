package models

import "time"

type ConfigUmbral struct {
	ID            int        `json:"id"`
	EquipoID      int        `json:"equipo_id"`
	Parametro     string     `json:"parametro"`
	UmbralMin     *float64   `json:"umbral_min"`
	UmbralMax     *float64   `json:"umbral_max"`
	Unidad        string     `json:"unidad"`
	Severidad     string     `json:"severidad"`
	Activo        bool       `json:"activo"`
	CreadoEn      time.Time  `json:"creado_en"`
	ActualizadoEn *time.Time `json:"actualizado_en"`
}
