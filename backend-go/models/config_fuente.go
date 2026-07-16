package models

type ConfigFuente struct {
	ID                int    `json:"id"`
	EquipoID          int    `json:"equipo_id"`
	TipoFuente        string `json:"tipo_fuente"`
	Endpoint          string `json:"endpoint"`
	IntervaloSegundos int    `json:"intervalo_segundos"`
	TimeoutSegundos   int    `json:"timeout_segundos"`
	Reintentos        int    `json:"reintentos"`
	Activo            bool   `json:"activo"`
}
