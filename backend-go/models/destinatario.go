package models

type Destinatario struct {
	ID      int    `json:"id"`
	GrupoID int    `json:"grupo_id"`
	Nombre  string `json:"nombre"`
	Canal   string `json:"canal"`
	Destino string `json:"destino"`
	Activo  bool   `json:"activo"`
}
