package models

import "time"

type Conexion struct {
	ID              int        `json:"id"`
	OrigenID        int        `json:"origen_id"`
	DestinoID       int        `json:"destino_id"`
	TipoConexion    string     `json:"tipo_conexion"`
	Protocolo       string     `json:"protocolo"`
	MedioFisico     string     `json:"medio_fisico"`
	PuertoOrigen    string     `json:"puerto_origen"`
	PuertoDestino   string     `json:"puerto_destino"`
	EtiquetaCable   string     `json:"etiqueta_cable"`
	Activo          bool       `json:"activo"`
	Notas           string     `json:"notas"`
	CreadoEn        time.Time  `json:"creado_en"`
	ActualizadoEn   *time.Time `json:"actualizado_en"`
}