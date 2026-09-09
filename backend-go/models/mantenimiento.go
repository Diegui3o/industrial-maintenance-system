package models

import "time"

type Mantenimiento struct {
	ID                    int        `json:"id"`
	EquipoID              int        `json:"equipo_id"`
	UsuarioID             *int       `json:"usuario_id,omitempty"`
	FechaReporte          time.Time  `json:"fecha_reporte"`
	Fase                  string     `json:"fase"`
	Taller                string     `json:"taller"`
	TipoCriticidad        *string    `json:"tipo_criticidad,omitempty"`
	Sistema               *string    `json:"sistema,omitempty"`
	InicioParada          *time.Time `json:"inicio_parada,omitempty"`
	FinParada             *time.Time `json:"fin_parada,omitempty"`
	Horas                 *float64   `json:"horas,omitempty"`
	TipoIntervencion      string     `json:"tipo_intervencion"`
	ModoFalla             *string    `json:"modo_falla,omitempty"`
	ConsecuenciaInmediata *string    `json:"consecuencia_inmediata,omitempty"`
	DescripcionEvento     *string    `json:"descripcion_evento,omitempty"`
	StandBy               bool       `json:"stand_by"`
	ProduccionAfectada    bool       `json:"produccion_afectada"`
	TnDejadasProcesar     *float64   `json:"tn_dejadas_procesar,omitempty"`
	Enlace                *string    `json:"enlace,omitempty"`
	EstadoFalla           string     `json:"estado_falla"`
	CreadoEn              time.Time  `json:"creado_en"`
	ActualizadoEn         *time.Time `json:"actualizado_en,omitempty"`
}