package models

type GrupoWhatsApp struct {
	ID     int    `json:"id"`
	Nombre string `json:"nombre"`
	JID    string `json:"jid"`
	Activo bool   `json:"activo"`
}
