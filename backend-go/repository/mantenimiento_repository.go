package repository

import (
	"backend/models"
	"database/sql"
)

type MantenimientoRepository struct {
	DB *sql.DB
}

func NewMantenimientoRepository(db *sql.DB) *MantenimientoRepository {
	return &MantenimientoRepository{DB: db}
}

func (r *MantenimientoRepository) Crear(m *models.Mantenimiento) error {
	query := `
        INSERT INTO mantenimiento (
            equipo_id, usuario_id, fecha_reporte, fase, taller,
            tipo_criticidad, sistema, inicio_parada, fin_parada, horas,
            tipo_intervencion, modo_falla, consecuencia_inmediata,
            descripcion_evento, stand_by, produccion_afectada,
            tn_dejadas_procesar, enlace
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
            $11,$12,$13,$14,$15,$16,$17,$18
        ) RETURNING id, creado_en
    `
	return r.DB.QueryRow(
		query,
		m.EquipoID, m.UsuarioID, m.FechaReporte, m.Fase, m.Taller,
		m.TipoCriticidad, m.Sistema, m.InicioParada, m.FinParada, m.Horas,
		m.TipoIntervencion, m.ModoFalla, m.ConsecuenciaInmediata,
		m.DescripcionEvento, m.StandBy, m.ProduccionAfectada,
		m.TnDejadasProcesar, m.Enlace,
	).Scan(&m.ID, &m.CreadoEn)
}

func (r *MantenimientoRepository) ObtenerPorID(id int) (*models.Mantenimiento, error) {
	m := &models.Mantenimiento{}
	query := `
        SELECT id, equipo_id, usuario_id, fecha_reporte, fase, taller,
               tipo_criticidad, sistema, inicio_parada, fin_parada, horas,
               tipo_intervencion, modo_falla, consecuencia_inmediata,
               descripcion_evento, stand_by, produccion_afectada,
               tn_dejadas_procesar, enlace, estado_falla, creado_en, actualizado_en
        FROM mantenimiento WHERE id = $1
    `
	err := r.DB.QueryRow(query, id).Scan(
		&m.ID, &m.EquipoID, &m.UsuarioID, &m.FechaReporte, &m.Fase, &m.Taller,
		&m.TipoCriticidad, &m.Sistema, &m.InicioParada, &m.FinParada, &m.Horas,
		&m.TipoIntervencion, &m.ModoFalla, &m.ConsecuenciaInmediata,
		&m.DescripcionEvento, &m.StandBy, &m.ProduccionAfectada,
		&m.TnDejadasProcesar, &m.Enlace, &m.EstadoFalla, &m.CreadoEn, &m.ActualizadoEn,
	)
	return m, err
}

func (r *MantenimientoRepository) ListarPorEquipo(equipoID int) ([]models.Mantenimiento, error) {
	query := `
        SELECT id, fecha_reporte, fase, taller, tipo_intervencion, 
               estado_falla, horas, descripcion_evento
        FROM mantenimiento WHERE equipo_id = $1
        ORDER BY fecha_reporte DESC, creado_en DESC
    `
	rows, err := r.DB.Query(query, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Mantenimiento
	for rows.Next() {
		var m models.Mantenimiento
		rows.Scan(&m.ID, &m.FechaReporte, &m.Fase, &m.Taller,
			&m.TipoIntervencion, &m.EstadoFalla, &m.Horas, &m.DescripcionEvento)
		lista = append(lista, m)
	}
	return lista, rows.Err()
}
