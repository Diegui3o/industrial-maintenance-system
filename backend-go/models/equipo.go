package models

import "time"

type Equipo struct {
	ID               int        `json:"id"`
	Codigo           string     `json:"codigo"`
	Nombre           string     `json:"nombre"`
	Area             string     `json:"area"`
	Tipo             string     `json:"tipo"`
	Fase             string     `json:"fase"`
	Fabricante       string     `json:"fabricante"`
	Modelo           string     `json:"modelo"`
	NumeroSerie      string     `json:"numero_serie"`
	Critico          bool       `json:"critico"`
	EstadoEquipo     string     `json:"estado_equipo"`
	FechaInstalacion *time.Time `json:"fecha_instalacion"`
	FechaCreacion    time.Time  `json:"fecha_creacion"`
	ActualizadoEn    *time.Time `json:"actualizado_en"`
}
