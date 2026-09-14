package repository

import "database/sql"

type MantenimientoOperacionRepository struct {
	DB *sql.DB
}

func NewMantenimientoOperacionRepository(db *sql.DB) *MantenimientoOperacionRepository {
	return &MantenimientoOperacionRepository{DB: db}
}

// ============================================================
// PROGRAMACIÓN
// ============================================================

type MantenimientoProgramacion struct {
	ID                 int      `json:"id"`
	MantenimientoID    int      `json:"mantenimiento_id"`
	TipoProgramacion   string   `json:"tipo_programacion"`
	FechaProgramada    string   `json:"fecha_programada"`
	Semana             *int     `json:"semana"`
	CodigoPrograma     *string  `json:"codigo_programa"`
	OT                 *string  `json:"ot"`
	CodigoSAP          *string  `json:"codigo_sap"`
	HorasPlanificadas  *float64 `json:"horas_planificadas"`
	HHPlanificadas     *float64 `json:"hh_planificadas"`
	Prioridad          *string  `json:"prioridad"`
	Instrucciones      *string  `json:"instrucciones"`
	Comentario         *string  `json:"comentario"`
}

func (r *MantenimientoOperacionRepository) CrearProgramacion(
	mantenimientoID int,
	p MantenimientoProgramacion,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_programacion (
			mantenimiento_id,
			tipo_programacion,
			fecha_programada,
			semana,
			codigo_programa,
			ot,
			codigo_sap,
			horas_planificadas,
			hh_planificadas,
			prioridad,
			instrucciones,
			comentario
		)
		VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
		)
		RETURNING id
	`,
		mantenimientoID,
		p.TipoProgramacion,
		p.FechaProgramada,
		p.Semana,
		p.CodigoPrograma,
		p.OT,
		p.CodigoSAP,
		p.HorasPlanificadas,
		p.HHPlanificadas,
		p.Prioridad,
		p.Instrucciones,
		p.Comentario,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoOperacionRepository) ListarProgramacion(
	mantenimientoID int,
) ([]MantenimientoProgramacion, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			tipo_programacion,
			fecha_programada,
			semana,
			codigo_programa,
			ot,
			codigo_sap,
			horas_planificadas,
			hh_planificadas,
			prioridad,
			instrucciones,
			comentario
		FROM mantenimiento_programacion
		WHERE mantenimiento_id = $1
		ORDER BY fecha_programada ASC, id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoProgramacion

	for rows.Next() {
		var p MantenimientoProgramacion

		if err := rows.Scan(
			&p.ID,
			&p.MantenimientoID,
			&p.TipoProgramacion,
			&p.FechaProgramada,
			&p.Semana,
			&p.CodigoPrograma,
			&p.OT,
			&p.CodigoSAP,
			&p.HorasPlanificadas,
			&p.HHPlanificadas,
			&p.Prioridad,
			&p.Instrucciones,
			&p.Comentario,
		); err != nil {
			return nil, err
		}

		lista = append(lista, p)
	}

	return lista, rows.Err()
}

// ============================================================
// EJECUCIÓN
// ============================================================

type MantenimientoEjecucion struct {
	ID                 int      `json:"id"`
	MantenimientoID    int      `json:"mantenimiento_id"`
	FechaInicio        *string  `json:"fecha_inicio"`
	FechaFin           *string  `json:"fecha_fin"`
	HorasEjecutadas    *float64 `json:"horas_ejecutadas"`
	HHEjecutadas       *float64 `json:"hh_ejecutadas"`
	Supervisor         *string  `json:"supervisor"`
	DescripcionTecnica *string  `json:"descripcion_tecnica"`
	Desviaciones       *string  `json:"desviaciones"`
	PETAR              *bool    `json:"petar"`
	EquipoDetiene      *bool    `json:"equipo_detiene"`
	EjecutadoEn        string   `json:"ejecutado_en"`
}

func (r *MantenimientoOperacionRepository) CrearEjecucion(
	mantenimientoID int,
	e MantenimientoEjecucion,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_ejecucion (
			mantenimiento_id,
			fecha_inicio,
			fecha_fin,
			horas_ejecutadas,
			hh_ejecutadas,
			supervisor,
			descripcion_tecnica,
			desviaciones,
			petar,
			equipo_detiene
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id
	`,
		mantenimientoID,
		e.FechaInicio,
		e.FechaFin,
		e.HorasEjecutadas,
		e.HHEjecutadas,
		e.Supervisor,
		e.DescripcionTecnica,
		e.Desviaciones,
		e.PETAR,
		e.EquipoDetiene,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoOperacionRepository) ListarEjecuciones(
	mantenimientoID int,
) ([]MantenimientoEjecucion, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			fecha_inicio,
			fecha_fin,
			horas_ejecutadas,
			hh_ejecutadas,
			supervisor,
			descripcion_tecnica,
			desviaciones,
			petar,
			equipo_detiene,
			ejecutado_en
		FROM mantenimiento_ejecucion
		WHERE mantenimiento_id = $1
		ORDER BY ejecutado_en ASC, id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoEjecucion

	for rows.Next() {
		var e MantenimientoEjecucion

		if err := rows.Scan(
			&e.ID,
			&e.MantenimientoID,
			&e.FechaInicio,
			&e.FechaFin,
			&e.HorasEjecutadas,
			&e.HHEjecutadas,
			&e.Supervisor,
			&e.DescripcionTecnica,
			&e.Desviaciones,
			&e.PETAR,
			&e.EquipoDetiene,
			&e.EjecutadoEn,
		); err != nil {
			return nil, err
		}

		lista = append(lista, e)
	}

	return lista, rows.Err()
}

// ============================================================
// MATERIALES
// ============================================================

type MantenimientoMaterial struct {
	ID              int      `json:"id"`
	MantenimientoID int      `json:"mantenimiento_id"`
	RepuestoID      *int     `json:"repuesto_id"`
	ComponenteID    *int     `json:"componente_id"`
	SubcomponenteID *int     `json:"subcomponente_id"`
	Descripcion     *string  `json:"descripcion"`
	Cantidad        float64  `json:"cantidad"`
	Unidad          *string  `json:"unidad"`
	CostoUnitario   *float64 `json:"costo_unitario"`
	CostoTotal      *float64 `json:"costo_total"`
	CodigoSAP       *string  `json:"codigo_sap"`
	Observacion     *string  `json:"observacion"`
}

func (r *MantenimientoOperacionRepository) CrearMaterial(
	mantenimientoID int,
	m MantenimientoMaterial,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_materiales (
			mantenimiento_id,
			repuesto_id,
			componente_id,
			subcomponente_id,
			descripcion,
			cantidad,
			unidad,
			costo_unitario,
			costo_total,
			codigo_sap,
			observacion
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
		RETURNING id
	`,
		mantenimientoID,
		m.RepuestoID,
		m.ComponenteID,
		m.SubcomponenteID,
		m.Descripcion,
		m.Cantidad,
		m.Unidad,
		m.CostoUnitario,
		m.CostoTotal,
		m.CodigoSAP,
		m.Observacion,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoOperacionRepository) ListarMateriales(
	mantenimientoID int,
) ([]MantenimientoMaterial, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			repuesto_id,
			componente_id,
			subcomponente_id,
			descripcion,
			cantidad,
			unidad,
			costo_unitario,
			costo_total,
			codigo_sap,
			observacion
		FROM mantenimiento_materiales
		WHERE mantenimiento_id = $1
		ORDER BY id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoMaterial

	for rows.Next() {
		var m MantenimientoMaterial

		if err := rows.Scan(
			&m.ID,
			&m.MantenimientoID,
			&m.RepuestoID,
			&m.ComponenteID,
			&m.SubcomponenteID,
			&m.Descripcion,
			&m.Cantidad,
			&m.Unidad,
			&m.CostoUnitario,
			&m.CostoTotal,
			&m.CodigoSAP,
			&m.Observacion,
		); err != nil {
			return nil, err
		}

		lista = append(lista, m)
	}

	return lista, rows.Err()
}

// ============================================================
// PARADAS / IMPACTO
// ============================================================

type MantenimientoParada struct {
	ID                 int      `json:"id"`
	MantenimientoID    int      `json:"mantenimiento_id"`
	Nivel              string   `json:"nivel"`
	EquipoID           *int     `json:"equipo_id"`
	FechaInicio        *string  `json:"fecha_inicio"`
	FechaFin           *string  `json:"fecha_fin"`
	Horas              *float64 `json:"horas"`
	ProduccionAfectada bool     `json:"produccion_afectada"`
	TnDejadasProcesar  *float64 `json:"tn_dejadas_procesar"`
	Descripcion        *string  `json:"descripcion"`
}

func (r *MantenimientoOperacionRepository) CrearParada(
	mantenimientoID int,
	p MantenimientoParada,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_paradas (
			mantenimiento_id,
			nivel,
			equipo_id,
			fecha_inicio,
			fecha_fin,
			horas,
			produccion_afectada,
			tn_dejadas_procesar,
			descripcion
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id
	`,
		mantenimientoID,
		p.Nivel,
		p.EquipoID,
		p.FechaInicio,
		p.FechaFin,
		p.Horas,
		p.ProduccionAfectada,
		p.TnDejadasProcesar,
		p.Descripcion,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoOperacionRepository) ListarParadas(
	mantenimientoID int,
) ([]MantenimientoParada, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			nivel,
			equipo_id,
			fecha_inicio,
			fecha_fin,
			horas,
			produccion_afectada,
			tn_dejadas_procesar,
			descripcion
		FROM mantenimiento_paradas
		WHERE mantenimiento_id = $1
		ORDER BY fecha_inicio ASC NULLS LAST, id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoParada

	for rows.Next() {
		var p MantenimientoParada

		if err := rows.Scan(
			&p.ID,
			&p.MantenimientoID,
			&p.Nivel,
			&p.EquipoID,
			&p.FechaInicio,
			&p.FechaFin,
			&p.Horas,
			&p.ProduccionAfectada,
			&p.TnDejadasProcesar,
			&p.Descripcion,
		); err != nil {
			return nil, err
		}

		lista = append(lista, p)
	}

	return lista, rows.Err()
}

func (r *MantenimientoOperacionRepository) ActualizarProgramacion(
	id int,
	m MantenimientoProgramacion,
) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento_programacion
		SET
			tipo_programacion = $1,
			fecha_programada = $2,
			semana = $3,
			codigo_programa = $4,
			ot = $5,
			codigo_sap = $6,
			horas_planificadas = $7,
			hh_planificadas = $8,
			prioridad = $9,
			instrucciones = $10,
			comentario = $11
		WHERE id = $12
	`,
		m.TipoProgramacion,
		m.FechaProgramada,
		m.Semana,
		m.CodigoPrograma,
		m.OT,
		m.CodigoSAP,
		m.HorasPlanificadas,
		m.HHPlanificadas,
		m.Prioridad,
		m.Instrucciones,
		m.Comentario,
		id,
	)

	return err
}

func (r *MantenimientoOperacionRepository) ActualizarEjecucion(
	id int,
	m MantenimientoEjecucion,
) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento_ejecucion
		SET
			fecha_inicio = $1,
			fecha_fin = $2,
			horas_ejecutadas = $3,
			hh_ejecutadas = $4,
			supervisor = $5,
			descripcion_tecnica = $6,
			desviaciones = $7,
			petar = $8,
			equipo_detiene = $9
		WHERE id = $10
	`,
		m.FechaInicio,
		m.FechaFin,
		m.HorasEjecutadas,
		m.HHEjecutadas,
		m.Supervisor,
		m.DescripcionTecnica,
		m.Desviaciones,
		m.PETAR,
		m.EquipoDetiene,
		id,
	)

	return err
}

func (r *MantenimientoOperacionRepository) ActualizarMaterial(
	id int,
	m MantenimientoMaterial,
) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento_materiales
		SET
			repuesto_id = $1,
			componente_id = $2,
			subcomponente_id = $3,
			descripcion = $4,
			cantidad = $5,
			unidad = $6,
			costo_unitario = $7,
			costo_total = $8,
			codigo_sap = $9,
			observacion = $10
		WHERE id = $11
	`,
		m.RepuestoID,
		m.ComponenteID,
		m.SubcomponenteID,
		m.Descripcion,
		m.Cantidad,
		m.Unidad,
		m.CostoUnitario,
		m.CostoTotal,
		m.CodigoSAP,
		m.Observacion,
		id,
	)

	return err
}

func (r *MantenimientoOperacionRepository) ActualizarParada(
	id int,
	m MantenimientoParada,
) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento_paradas
		SET
			nivel = $1,
			equipo_id = $2,
			fecha_inicio = $3,
			fecha_fin = $4,
			horas = $5,
			produccion_afectada = $6,
			tn_dejadas_procesar = $7,
			descripcion = $8
		WHERE id = $9
	`,
		m.Nivel,
		m.EquipoID,
		m.FechaInicio,
		m.FechaFin,
		m.Horas,
		m.ProduccionAfectada,
		m.TnDejadasProcesar,
		m.Descripcion,
		id,
	)

	return err
}