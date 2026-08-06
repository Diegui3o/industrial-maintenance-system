// models/dashboard.go
package models

type DashboardResumen struct {
	TotalEquipos           int `json:"total_equipos"`
	EquiposActivos         int `json:"equipos_activos"`
	EquiposEnFallo         int `json:"equipos_en_fallo"`
	EquiposEnMantenimiento int `json:"equipos_en_mantenimiento"`
	EquiposInactivos       int `json:"equipos_inactivos"`
	EquiposCriticosEnFallo int `json:"equipos_criticos_en_fallo"`
	AlarmasActivas         int `json:"alarmas_activas"`
}
