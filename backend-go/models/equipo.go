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

	FaseUbicacion   string `json:"fase_ubicacion"`
	AreaFuncional   string `json:"area_funcional"`
	Tag             string `json:"tag"`
	UbicacionFisica string `json:"ubicacion_fisica"`
	DescripcionLarga string `json:"descripcion_larga"`

	IP               string `json:"ip"`
	Relacionado      bool   `json:"relacionado"`
	SubprocesoNombre string `json:"subproceso_nombre,omitempty"`
}