package models

import "time"

type PlantillaNotificacion struct {
	ID       int       `json:"id"`
	Nombre   string    `json:"nombre"`
	Canal    string    `json:"canal"`
	Asunto   string    `json:"asunto"`
	Cuerpo   string    `json:"cuerpo"`
	Activo   bool      `json:"activo"`
	CreadoEn time.Time `json:"creado_en"`
}
