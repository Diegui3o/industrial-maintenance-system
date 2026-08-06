package models

import "time"

type Usuario struct {
	ID       int       `json:"id"`
	Nombre   string    `json:"nombre"`
	Username string    `json:"username"`
	Area     string    `json:"area"`
	APIKey   string    `json:"api_key,omitempty"`
	Rol      string    `json:"rol"`
	CreadoEn time.Time `json:"creado_en"`
}
