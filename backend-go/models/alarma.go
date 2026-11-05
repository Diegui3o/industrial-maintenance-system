// models/alarma.go
package models

import "time"

type Alarma struct {
	ID            int        `json:"id"`
	EquipoID      int        `json:"equipo_id"`
	ComponenteID  *int       `json:"componente_id,omitempty"`
	RepuestoID    *int       `json:"repuesto_id,omitempty"`
	TagID         *int       `json:"tag_id,omitempty"`
	Parametro     *string    `json:"parametro,omitempty"`
	ActivoTipo    string     `json:"activo_tipo,omitempty"`
	Tipo          string     `json:"tipo"`
	Mensaje       string     `json:"mensaje"`
	Severidad     string     `json:"severidad"`
	Estado        string     `json:"estado"`
	FechaGenerada time.Time  `json:"fecha_generada"`
	FechaCierre   *time.Time `json:"fecha_cierre"`
}