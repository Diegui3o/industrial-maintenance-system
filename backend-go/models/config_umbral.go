package models

import "time"

type ConfigUmbral struct {
	ID                   int        `json:"id"`
	EquipoID             int        `json:"equipo_id"`
	ComponenteID         *int       `json:"componente_id,omitempty"`
	RepuestoID           *int       `json:"repuesto_id,omitempty"`
	TagID                *int       `json:"tag_id,omitempty"`
	Parametro            string     `json:"parametro"`
	UmbralMin            *float64   `json:"umbral_min"`
	UmbralMax            *float64   `json:"umbral_max"`
	Unidad               string     `json:"unidad"`
	Severidad            string     `json:"severidad"`
	Activo               bool       `json:"activo"`
	Modo                 string     `json:"modo"`
	ContarTiempoActivo   bool       `json:"contar_tiempo_activo"`
	LecturasConfirmacion *int       `json:"lecturas_confirmacion,omitempty"`
	HistMin              *float64   `json:"hist_min,omitempty"`
	HistMax              *float64   `json:"hist_max,omitempty"`

	// Reporte de paradas
	ReportarParada            bool     `json:"reportar_parada"`
	UmbralParada              *float64 `json:"umbral_parada,omitempty"`
	MinDuracionParadaSegundos *int     `json:"min_duracion_parada_segundos,omitempty"`

	CreadoEn      time.Time  `json:"creado_en"`
	ActualizadoEn *time.Time `json:"actualizado_en"`
}