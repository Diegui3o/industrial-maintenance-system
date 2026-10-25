package models

import "time"

// TiempoActivo representa un periodo con estado definido para un tag.
type TiempoActivo struct {
	ID               int        `json:"id"`
	TagID            int        `json:"tag_id"`
	ActivoTipo       string     `json:"activo_tipo,omitempty"`
	ActivoID         int        `json:"activo_id,omitempty"`
	Estado           string     `json:"estado"` // 'activo', 'inactivo', 'sin_dato'
	Desde            time.Time  `json:"desde"`
	Hasta            *time.Time `json:"hasta,omitempty"`
	DuracionSegundos *int       `json:"duracion_segundos,omitempty"`
	MotivoCierre     string     `json:"motivo_cierre,omitempty"`
	ValorPromedio    *float64   `json:"valor_promedio,omitempty"`
	ValorMin         *float64   `json:"valor_min,omitempty"`
	ValorMax         *float64   `json:"valor_max,omitempty"`
}

// ResumenGuardia es el agregado de una guardia de 12 h.
type ResumenGuardia struct {
	FechaRef         string    `json:"fecha_ref"`   // YYYY-MM-DD
	Tipo             string    `json:"tipo"`        // 'dia' | 'noche'
	GuardiaInicio    time.Time `json:"guardia_inicio"`
	GuardiaFin       time.Time `json:"guardia_fin"`
	ActivoSegundos   int       `json:"activo_segundos"`
	InactivoSegundos int       `json:"inactivo_segundos"`
	SinDatoSegundos  int       `json:"sin_dato_segundos"`
	TotalSegundos    int       `json:"total_segundos"`
}

// ResumenDia es el agregado de un día operativo (07:00 → 07:00).
type ResumenDia struct {
	FechaOperativa   string           `json:"fecha_operativa"` // YYYY-MM-DD
	PeriodoInicio    time.Time        `json:"periodo_inicio"`
	PeriodoFin       time.Time        `json:"periodo_fin"`
	ActivoSegundos   int              `json:"activo_segundos"`
	InactivoSegundos int              `json:"inactivo_segundos"`
	SinDatoSegundos  int              `json:"sin_dato_segundos"`
	TotalSegundos    int              `json:"total_segundos"`
	Guardias         []ResumenGuardia `json:"guardias"`
}