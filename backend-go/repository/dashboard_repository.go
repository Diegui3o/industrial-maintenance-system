// repository/dashboard_repository.go
package repository

import (
	"backend/models"
	"database/sql"
)

type DashboardRepository struct {
	DB *sql.DB
}

func (r *DashboardRepository) ObtenerResumen() (*models.DashboardResumen, error) {
	resumen := &models.DashboardResumen{}

	queries := []struct {
		campo *int
		query string
	}{
		{&resumen.TotalEquipos, `SELECT COUNT(*) FROM equipos`},
		{&resumen.EquiposActivos, `SELECT COUNT(*) FROM equipos WHERE estado_equipo = 'activo'`},
		{&resumen.EquiposEnFallo, `SELECT COUNT(*) FROM equipos WHERE estado_equipo = 'fallo'`},
		{&resumen.EquiposEnMantenimiento, `SELECT COUNT(*) FROM equipos WHERE estado_equipo = 'mantenimiento'`},
		{&resumen.EquiposInactivos, `SELECT COUNT(*) FROM equipos WHERE estado_equipo = 'inactivo'`},
		{&resumen.EquiposCriticosEnFallo, `SELECT COUNT(*) FROM equipos WHERE estado_equipo = 'fallo' AND critico = true`},
		{&resumen.AlarmasActivas, `SELECT COUNT(*) FROM alarmas WHERE estado = 'activa'`},
	}

	for _, q := range queries {
		if err := r.DB.QueryRow(q.query).Scan(q.campo); err != nil {
			return nil, err
		}
	}

	return resumen, nil
}
