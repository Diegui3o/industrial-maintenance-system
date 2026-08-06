package models

type EquipoGrupo struct {
	ID       int `json:"id"`
	EquipoID int `json:"equipo_id"`
	GrupoID  int `json:"grupo_id"`
}
