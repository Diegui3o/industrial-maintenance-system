package models

import "time"

type Notificacion struct {
	ID           int        `json:"id"`
	Tipo         string     `json:"tipo"`
	Destinatario string     `json:"destinatario"`
	Mensaje      string     `json:"mensaje"`
	Estado       string     `json:"estado"`
	Intentos     int        `json:"intentos"`
	CreadoEn     time.Time  `json:"creado_en"`
	EnviadoEn    *time.Time `json:"enviado_en"`
}
