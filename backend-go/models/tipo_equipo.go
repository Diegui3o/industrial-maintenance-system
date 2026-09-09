package models

type TipoEquipo struct {
	ID          int     `json:"id"`
	Codigo      string  `json:"codigo"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type EquipoTipo struct {
	EquipoID    int `json:"equipo_id"`
	TipoEquipoID int `json:"tipo_equipo_id"`
}