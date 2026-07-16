package models

import "time"

type Usuario struct {
	ID       int       `json:"id"`
	Nombre   string    `json:"nombre"`
	Username string    `json:"username"`
	Area     string    `json:"area"`
	CreadoEn time.Time `json:"creado_en"`
}
