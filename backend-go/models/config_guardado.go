// models/config_guardado.go
package models

import "time"

type ConfigPrioridad struct {
	ID                       int        `json:"id"`
	Nombre                   string     `json:"nombre"`
	Descripcion              string     `json:"descripcion"`
	GuardarSiempre           bool       `json:"guardar_siempre"`
	MuestreoIntervaloMinutos int        `json:"muestreo_intervalo_minutos"`
	CambioMinimoPorcentaje   float64    `json:"cambio_minimo_porcentaje"`
	GuardarSiCalidadMala     bool       `json:"guardar_si_calidad_mala"`
	CreadoEn                 time.Time  `json:"creado_en"`
	ActualizadoEn            *time.Time `json:"actualizado_en"`
}

type ConfigEventoEspecial struct {
	ID                     int        `json:"id"`
	Nombre                 string     `json:"nombre"`
	Descripcion            string     `json:"descripcion"`
	PrioridadID            int        `json:"prioridad_id"`
	GuardarAntes           bool       `json:"guardar_antes"`
	GuardarDurante         bool       `json:"guardar_durante"`
	GuardarDespues         bool       `json:"guardar_despues"`
	VentanaSegundosAntes   int        `json:"ventana_segundos_antes"`
	VentanaSegundosDespues int        `json:"ventana_segundos_despues"`
	Activo                 bool       `json:"activo"`
	CreadoEn               time.Time  `json:"creado_en"`
	ActualizadoEn          *time.Time `json:"actualizado_en"`
}

type DatoEvento struct {
	ID              int       `json:"id"`
	EquipoID        int       `json:"equipo_id"`
	TipoEvento      string    `json:"tipo_evento"`
	Descripcion     string    `json:"descripcion"`
	EstadoAnterior  string    `json:"estado_anterior"`
	EstadoNuevo     string    `json:"estado_nuevo"`
	ValorAnterior   *float64  `json:"valor_anterior"`
	ValorNuevo      *float64  `json:"valor_nuevo"`
	Parametro       string    `json:"parametro"`
	TimestampEvento time.Time `json:"timestamp_evento"`
	CreadoEn        time.Time `json:"creado_en"`
}
