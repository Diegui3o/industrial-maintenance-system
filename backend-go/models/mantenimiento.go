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
	ComponenteID        *int       `json:"componente_id,omitempty"`
	SubcomponenteID     *int       `json:"subcomponente_id,omitempty"`
	Prioridad           *string    `json:"prioridad,omitempty"`
	Causa               *string    `json:"causa,omitempty"`
	AccionRealizada     *string    `json:"accion_realizada,omitempty"`
	Consecuencia        *string    `json:"consecuencia,omitempty"`
	DescripcionTecnica  *string    `json:"descripcion_tecnica,omitempty"`
	FechaInicioReal     *time.Time `json:"fecha_inicio_real,omitempty"`
	FechaFinReal        *time.Time `json:"fecha_fin_real,omitempty"`
	PorcentajeAvance    *float64   `json:"porcentaje_avance,omitempty"`
	TipoProgramacion    *string    `json:"tipo_programacion,omitempty"`
	FechaProgramada     *time.Time `json:"fecha_programada,omitempty"`
	HorasPlanificadas   *float64   `json:"horas_planificadas,omitempty"`
	HHPlanificadas      *float64   `json:"hh_planificadas,omitempty"`
	HorasEjecutadas     *float64   `json:"horas_ejecutadas,omitempty"`
	HHEjecutadas        *float64   `json:"hh_ejecutadas,omitempty"`
	CreadoEn              time.Time  `json:"creado_en"`
	ActualizadoEn         *time.Time `json:"actualizado_en,omitempty"`
}