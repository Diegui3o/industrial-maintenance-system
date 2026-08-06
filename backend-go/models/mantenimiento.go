package models

import "time"

type Mantenimiento struct {
	ID        int  `json:"id"`
	EquipoID  int  `json:"equipo_id"`
	UsuarioID *int `json:"usuario_id"`

	// Campos del formato oficial
	FechaReporte   time.Time `json:"fecha_reporte"`
	Fase           string    `json:"fase"`
	Taller         string    `json:"taller"`
	TipoCriticidad string    `json:"tipo_criticidad"`
	Sistema        string    `json:"sistema"`

	InicioParada *time.Time `json:"inicio_parada"`
	FinParada    *time.Time `json:"fin_parada"`
	Horas        float64    `json:"horas"`

	TipoIntervencion      string `json:"tipo_intervencion"`
	ModoFalla             string `json:"modo_falla"`
	ConsecuenciaInmediata string `json:"consecuencia_inmediata"`
	DescripcionEvento     string `json:"descripcion_evento"`

	StandBy            bool    `json:"stand_by"`
	ProduccionAfectada bool    `json:"produccion_afectada"`
	TnDejadasProcesar  float64 `json:"tn_dejadas_procesar"`

	Enlace string `json:"enlace"`

	// Control
	EstadoFalla   string     `json:"estado_falla"`
	CreadoEn      time.Time  `json:"creado_en"`
	ActualizadoEn *time.Time `json:"actualizado_en"`
}
