package models

type EventoEstado struct {
	ID int `json:"id"`

	EquipoID int `json:"equipo_id"`

	Estado string `json:"estado"`

	Motivo string `json:"motivo"`

	FechaInicio string `json:"fecha_inicio"`

	FechaFin *string `json:"fecha_fin"`
}
