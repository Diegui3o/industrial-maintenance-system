// models/alarma.go
package models

import "time"

type Alarma struct {
	ID            int        `json:"id"`
	EquipoID      int        `json:"equipo_id"`
	Tipo          string     `json:"tipo"`
	Mensaje       string     `json:"mensaje"`
	Severidad     string     `json:"severidad"`
	Estado        string     `json:"estado"`
	FechaGenerada time.Time  `json:"fecha_generada"`
	FechaCierre   *time.Time `json:"fecha_cierre"`
}
