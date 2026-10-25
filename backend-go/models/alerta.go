package models

import "time"

type Alerta struct {
	ID             int        `json:"id"`
	EquipoID       *int       `json:"equipo_id,omitempty"`
	ComponenteID   *int       `json:"componente_id,omitempty"`
	RepuestoID     *int       `json:"repuesto_id,omitempty"`
	TagID          *int       `json:"tag_id,omitempty"`
	Parametro      *string    `json:"parametro,omitempty"`
	ActivoTipo     string     `json:"activo_tipo,omitempty"`
	Mensaje        string     `json:"mensaje"`
	Severidad      string     `json:"severidad"`
	Estado         string     `json:"estado"`
	ValorDetectado *float64   `json:"valor_detectado,omitempty"`
	UmbralMin      *float64   `json:"umbral_min,omitempty"`
	UmbralMax      *float64   `json:"umbral_max,omitempty"`
	FechaGenerada  time.Time  `json:"fecha_generada"`
	FechaVista     *time.Time `json:"fecha_vista,omitempty"`
}