package repository

import (
	"database/sql"

	"backend/models"
)

type MantenimientoRepository struct {
	DB *sql.DB
}

func NewMantenimientoRepository(db *sql.DB) *MantenimientoRepository {
	return &MantenimientoRepository{
		DB: db,
	}
}

func (r *MantenimientoRepository) Crear(m *models.Mantenimiento) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento (
			equipo_id,
			usuario_id,
			fecha_reporte,
			fase,
			taller,
			tipo_criticidad,
			sistema,
			inicio_parada,
			fin_parada,
			horas,
			tipo_intervencion,
			modo_falla,
			consecuencia_inmediata,
			descripcion_evento,
			stand_by,
			produccion_afectada,
			tn_dejadas_procesar,
			enlace,
			estado_falla,
			componente_id,
			subcomponente_id,
			prioridad,
			causa,
			accion_realizada,
			consecuencia,
			descripcion_tecnica,
			fecha_inicio_real,
			fecha_fin_real,
			porcentaje_avance,
			tipo_programacion,
			fecha_programada,
			horas_planificadas,
			hh_planificadas,
			horas_ejecutadas,
			hh_ejecutadas
		)
		VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
			$11,$12,$13,$14,$15,$16,$17,$18,$19,
			$20,$21,$22,$23,$24,$25,$26,$27,$28,
			$29,$30,$31,$32,$33,$34,$35
		)
		RETURNING id
	`,
		m.EquipoID,
		m.UsuarioID,
		m.FechaReporte,
		m.Fase,
		m.Taller,
		m.TipoCriticidad,
		m.Sistema,
		m.InicioParada,
		m.FinParada,
		m.Horas,
		m.TipoIntervencion,
		m.ModoFalla,
		m.ConsecuenciaInmediata,
		m.DescripcionEvento,
		m.StandBy,
		m.ProduccionAfectada,
		m.TnDejadasProcesar,
		m.Enlace,
		m.EstadoFalla,
		m.ComponenteID,
		m.SubcomponenteID,
		m.Prioridad,
		m.Causa,
		m.AccionRealizada,
		m.Consecuencia,
		m.DescripcionTecnica,
		m.FechaInicioReal,
		m.FechaFinReal,
		m.PorcentajeAvance,
		m.TipoProgramacion,
		m.FechaProgramada,
		m.HorasPlanificadas,
		m.HHPlanificadas,
		m.HorasEjecutadas,
		m.HHEjecutadas,
	).Scan(&id)

	if err != nil {
		return 0, err
	}

	return id, nil
}

func (r *MantenimientoRepository) ObtenerPorID(id int) (*models.Mantenimiento, error) {
	m := &models.Mantenimiento{}

	err := r.DB.QueryRow(`
		SELECT
			id,
			equipo_id,
			usuario_id,
			fecha_reporte,
			fase,
			taller,
			tipo_criticidad,
			sistema,
			inicio_parada,
			fin_parada,
			horas,
			tipo_intervencion,
			modo_falla,
			consecuencia_inmediata,
			descripcion_evento,
			stand_by,
			produccion_afectada,
			tn_dejadas_procesar,
			enlace,
			estado_falla,
			componente_id,
			subcomponente_id,
			prioridad,
			causa,
			accion_realizada,
			consecuencia,
			descripcion_tecnica,
			fecha_inicio_real,
			fecha_fin_real,
			porcentaje_avance,
			tipo_programacion,
			fecha_programada,
			horas_planificadas,
			hh_planificadas,
			horas_ejecutadas,
			hh_ejecutadas,
			creado_en,
			actualizado_en
		FROM mantenimiento
		WHERE id = $1
	`, id).Scan(
		&m.ID,
		&m.EquipoID,
		&m.UsuarioID,
		&m.FechaReporte,
		&m.Fase,
		&m.Taller,
		&m.TipoCriticidad,
		&m.Sistema,
		&m.InicioParada,
		&m.FinParada,
		&m.Horas,
		&m.TipoIntervencion,
		&m.ModoFalla,
		&m.ConsecuenciaInmediata,
		&m.DescripcionEvento,
		&m.StandBy,
		&m.ProduccionAfectada,
		&m.TnDejadasProcesar,
		&m.Enlace,
		&m.EstadoFalla,
		&m.ComponenteID,
		&m.SubcomponenteID,
		&m.Prioridad,
		&m.Causa,
		&m.AccionRealizada,
		&m.Consecuencia,
		&m.DescripcionTecnica,
		&m.FechaInicioReal,
		&m.FechaFinReal,
		&m.PorcentajeAvance,
		&m.TipoProgramacion,
		&m.FechaProgramada,
		&m.HorasPlanificadas,
		&m.HHPlanificadas,
		&m.HorasEjecutadas,
		&m.HHEjecutadas,
		&m.CreadoEn,
		&m.ActualizadoEn,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return m, nil
}

func (r *MantenimientoRepository) ListarPorEquipo(equipoID int) ([]models.Mantenimiento, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			equipo_id,
			usuario_id,
			fecha_reporte,
			fase,
			taller,
			tipo_criticidad,
			sistema,
			inicio_parada,
			fin_parada,
			horas,
			tipo_intervencion,
			modo_falla,
			consecuencia_inmediata,
			descripcion_evento,
			stand_by,
			produccion_afectada,
			tn_dejadas_procesar,
			enlace,
			estado_falla,
			componente_id,
			subcomponente_id,
			prioridad,
			causa,
			accion_realizada,
			consecuencia,
			descripcion_tecnica,
			fecha_inicio_real,
			fecha_fin_real,
			porcentaje_avance,
			tipo_programacion,
			fecha_programada,
			horas_planificadas,
			hh_planificadas,
			horas_ejecutadas,
			hh_ejecutadas,
			creado_en,
			actualizado_en
		FROM mantenimiento
		WHERE equipo_id = $1
		ORDER BY fecha_reporte DESC, id DESC
	`, equipoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Mantenimiento

	for rows.Next() {
		var m models.Mantenimiento

		err := rows.Scan(
			&m.ID,
			&m.EquipoID,
			&m.UsuarioID,
			&m.FechaReporte,
			&m.Fase,
			&m.Taller,
			&m.TipoCriticidad,
			&m.Sistema,
			&m.InicioParada,
			&m.FinParada,
			&m.Horas,
			&m.TipoIntervencion,
			&m.ModoFalla,
			&m.ConsecuenciaInmediata,
			&m.DescripcionEvento,
			&m.StandBy,
			&m.ProduccionAfectada,
			&m.TnDejadasProcesar,
			&m.Enlace,
			&m.EstadoFalla,
			&m.ComponenteID,
			&m.SubcomponenteID,
			&m.Prioridad,
			&m.Causa,
			&m.AccionRealizada,
			&m.Consecuencia,
			&m.DescripcionTecnica,
			&m.FechaInicioReal,
			&m.FechaFinReal,
			&m.PorcentajeAvance,
			&m.TipoProgramacion,
			&m.FechaProgramada,
			&m.HorasPlanificadas,
			&m.HHPlanificadas,
			&m.HorasEjecutadas,
			&m.HHEjecutadas,
			&m.CreadoEn,
			&m.ActualizadoEn,
		)

		if err != nil {
			return nil, err
		}

		lista = append(lista, m)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *MantenimientoRepository) Actualizar(id int, m models.Mantenimiento) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento
		SET
			equipo_id = $1,
			usuario_id = $2,
			fecha_reporte = $3,
			fase = $4,
			taller = $5,
			tipo_criticidad = $6,
			sistema = $7,
			inicio_parada = $8,
			fin_parada = $9,
			horas = $10,
			tipo_intervencion = $11,
			modo_falla = $12,
			consecuencia_inmediata = $13,
			descripcion_evento = $14,
			stand_by = $15,
			produccion_afectada = $16,
			tn_dejadas_procesar = $17,
			enlace = $18,
			estado_falla = $19,
			componente_id = $20,
			subcomponente_id = $21,
			prioridad = $22,
			causa = $23,
			accion_realizada = $24,
			consecuencia = $25,
			descripcion_tecnica = $26,
			fecha_inicio_real = $27,
			fecha_fin_real = $28,
			porcentaje_avance = $29,
			tipo_programacion = $30,
			fecha_programada = $31,
			horas_planificadas = $32,
			hh_planificadas = $33,
			horas_ejecutadas = $34,
			hh_ejecutadas = $35,
			actualizado_en = NOW()
		WHERE id = $36
	`,
		m.EquipoID,
		m.UsuarioID,
		m.FechaReporte,
		m.Fase,
		m.Taller,
		m.TipoCriticidad,
		m.Sistema,
		m.InicioParada,
		m.FinParada,
		m.Horas,
		m.TipoIntervencion,
		m.ModoFalla,
		m.ConsecuenciaInmediata,
		m.DescripcionEvento,
		m.StandBy,
		m.ProduccionAfectada,
		m.TnDejadasProcesar,
		m.Enlace,
		m.EstadoFalla,
		m.ComponenteID,
		m.SubcomponenteID,
		m.Prioridad,
		m.Causa,
		m.AccionRealizada,
		m.Consecuencia,
		m.DescripcionTecnica,
		m.FechaInicioReal,
		m.FechaFinReal,
		m.PorcentajeAvance,
		m.TipoProgramacion,
		m.FechaProgramada,
		m.HorasPlanificadas,
		m.HHPlanificadas,
		m.HorasEjecutadas,
		m.HHEjecutadas,
		id,
	)

	return err
}

func (r *MantenimientoRepository) ListarTodos() ([]models.Mantenimiento, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			equipo_id,
			usuario_id,
			fecha_reporte,
			fase,
			taller,
			tipo_criticidad,
			sistema,
			inicio_parada,
			fin_parada,
			horas,
			tipo_intervencion,
			modo_falla,
			consecuencia_inmediata,
			descripcion_evento,
			stand_by,
			produccion_afectada,
			tn_dejadas_procesar,
			enlace,
			estado_falla,
			componente_id,
			subcomponente_id,
			prioridad,
			causa,
			accion_realizada,
			consecuencia,
			descripcion_tecnica,
			fecha_inicio_real,
			fecha_fin_real,
			porcentaje_avance,
			tipo_programacion,
			fecha_programada,
			horas_planificadas,
			hh_planificadas,
			horas_ejecutadas,
			hh_ejecutadas,
			creado_en,
			actualizado_en
		FROM mantenimiento
		ORDER BY fecha_reporte DESC, id DESC
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Mantenimiento

	for rows.Next() {
		var m models.Mantenimiento

		err := rows.Scan(
			&m.ID,
			&m.EquipoID,
			&m.UsuarioID,
			&m.FechaReporte,
			&m.Fase,
			&m.Taller,
			&m.TipoCriticidad,
			&m.Sistema,
			&m.InicioParada,
			&m.FinParada,
			&m.Horas,
			&m.TipoIntervencion,
			&m.ModoFalla,
			&m.ConsecuenciaInmediata,
			&m.DescripcionEvento,
			&m.StandBy,
			&m.ProduccionAfectada,
			&m.TnDejadasProcesar,
			&m.Enlace,
			&m.EstadoFalla,
			&m.ComponenteID,
			&m.SubcomponenteID,
			&m.Prioridad,
			&m.Causa,
			&m.AccionRealizada,
			&m.Consecuencia,
			&m.DescripcionTecnica,
			&m.FechaInicioReal,
			&m.FechaFinReal,
			&m.PorcentajeAvance,
			&m.TipoProgramacion,
			&m.FechaProgramada,
			&m.HorasPlanificadas,
			&m.HHPlanificadas,
			&m.HorasEjecutadas,
			&m.HHEjecutadas,
			&m.CreadoEn,
			&m.ActualizadoEn,
		)

		if err != nil {
			return nil, err
		}

		lista = append(lista, m)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if lista == nil {
		lista = []models.Mantenimiento{}
	}

	return lista, nil
}
