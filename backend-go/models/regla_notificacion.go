package models

type ReglaNotificacion struct {
	ID          int    `json:"id"`
	EquipoID    *int   `json:"equipo_id"`
	Area        string `json:"area"`
	Severidad   string `json:"severidad"`
	TipoEvento  string `json:"tipo_evento"`
	GrupoID     int    `json:"grupo_id"`
	PlantillaID int    `json:"plantilla_id"`
	Activo      bool   `json:"activo"`
}
