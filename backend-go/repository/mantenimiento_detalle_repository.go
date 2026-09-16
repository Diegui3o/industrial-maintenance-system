package repository

import (
	"database/sql"
	"fmt"
)

type MantenimientoCompleto struct {
	Mantenimiento interface{}                 `json:"mantenimiento"`
	Actividades   []MantenimientoActividad    `json:"actividades"`
	Programacion  []MantenimientoProgramacion `json:"programacion"`
	Ejecuciones   []MantenimientoEjecucion    `json:"ejecuciones"`
	Avances       []MantenimientoAvance       `json:"avances"`
	Personal      []MantenimientoPersonal     `json:"personal"`
	Materiales    []MantenimientoMaterial     `json:"materiales"`
	Paradas       []MantenimientoParada       `json:"paradas"`
	Historial     []MantenimientoHistorial    `json:"historial"`
}

func (r *MantenimientoDetalleRepository) ObtenerCompleto(
	id int,
	m interface{},
) (*MantenimientoCompleto, error) {

	actividades, err := r.ListarActividades(id)
	if err != nil {
		return nil, err
	}

	operacionRepo := NewMantenimientoOperacionRepository(r.DB)

	programacion, err := operacionRepo.ListarProgramacion(id)
	if err != nil {
		return nil, err
	}

	ejecuciones, err := operacionRepo.ListarEjecuciones(id)
	if err != nil {
		return nil, err
	}

	avances, err := r.ListarAvances(id)
	if err != nil {
		return nil, err
	}

	personal, err := r.ListarPersonal(id)
	if err != nil {
		return nil, err
	}

	materiales, err := operacionRepo.ListarMateriales(id)
	if err != nil {
		return nil, err
	}

	paradas, err := operacionRepo.ListarParadas(id)
	if err != nil {
		return nil, err
	}

	historial, err := r.ListarHistorial(id)
	if err != nil {
		return nil, err
	}

	if actividades == nil {
		actividades = []MantenimientoActividad{}
	}
	if programacion == nil {
		programacion = []MantenimientoProgramacion{}
	}
	if ejecuciones == nil {
		ejecuciones = []MantenimientoEjecucion{}
	}
	if avances == nil {
		avances = []MantenimientoAvance{}
	}
	if personal == nil {
		personal = []MantenimientoPersonal{}
	}
	if materiales == nil {
		materiales = []MantenimientoMaterial{}
	}
	if paradas == nil {
		paradas = []MantenimientoParada{}
	}
	if historial == nil {
		historial = []MantenimientoHistorial{}
	}

	return &MantenimientoCompleto{
		Mantenimiento: m,
		Actividades:   actividades,
		Programacion:  programacion,
		Ejecuciones:   ejecuciones,
		Avances:       avances,
		Personal:      personal,
		Materiales:    materiales,
		Paradas:       paradas,
		Historial:     historial,
	}, nil
}

type MantenimientoDetalleRepository struct {
	DB *sql.DB
}

func NewMantenimientoDetalleRepository(db *sql.DB) *MantenimientoDetalleRepository {
	return &MantenimientoDetalleRepository{DB: db}
}

// ============================================================
// ACTIVIDADES
// ============================================================

type MantenimientoActividad struct {
	ID                int      `json:"id"`
	MantenimientoID   int      `json:"mantenimiento_id"`
	Descripcion       string   `json:"descripcion"`
	Estado            string   `json:"estado"`
	Prioridad         *string  `json:"prioridad"`
	HorasPlanificadas *float64 `json:"horas_planificadas"`
	HorasEjecutadas   *float64 `json:"horas_ejecutadas"`
	Porcentaje        float64  `json:"porcentaje"`
	FechaInicio       *string  `json:"fecha_inicio"`
	FechaFin          *string  `json:"fecha_fin"`
}

func (r *MantenimientoDetalleRepository) CrearActividad(
	mantenimientoID int,
	a MantenimientoActividad,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_actividades (
			mantenimiento_id,
			descripcion,
			estado,
			prioridad,
			horas_planificadas,
			horas_ejecutadas,
			porcentaje,
			fecha_inicio,
			fecha_fin
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id
	`,
		mantenimientoID,
		a.Descripcion,
		a.Estado,
		a.Prioridad,
		a.HorasPlanificadas,
		a.HorasEjecutadas,
		a.Porcentaje,
		a.FechaInicio,
		a.FechaFin,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoDetalleRepository) ListarActividades(
	mantenimientoID int,
) ([]MantenimientoActividad, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			descripcion,
			estado,
			prioridad,
			horas_planificadas,
			horas_ejecutadas,
			porcentaje,
			fecha_inicio,
			fecha_fin
		FROM mantenimiento_actividades
		WHERE mantenimiento_id = $1
		ORDER BY id
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoActividad

	for rows.Next() {
		var a MantenimientoActividad

		if err := rows.Scan(
			&a.ID,
			&a.MantenimientoID,
			&a.Descripcion,
			&a.Estado,
			&a.Prioridad,
			&a.HorasPlanificadas,
			&a.HorasEjecutadas,
			&a.Porcentaje,
			&a.FechaInicio,
			&a.FechaFin,
		); err != nil {
			return nil, err
		}

		lista = append(lista, a)
	}

	return lista, rows.Err()
}

// ============================================================
// AVANCES
// ============================================================

type MantenimientoAvance struct {
	ID              int     `json:"id"`
	MantenimientoID int     `json:"mantenimiento_id"`
	ActividadID     *int    `json:"actividad_id"`
	Porcentaje      float64 `json:"porcentaje"`
	Descripcion     *string `json:"descripcion"`
	Fecha           string  `json:"fecha"`
	UsuarioID       *int    `json:"usuario_id"`
}

func (r *MantenimientoDetalleRepository) CrearAvance(
	mantenimientoID int,
	a MantenimientoAvance,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_avances (
			mantenimiento_id,
			actividad_id,
			porcentaje,
			descripcion,
			usuario_id
		)
		VALUES ($1,$2,$3,$4,$5)
		RETURNING id
	`,
		mantenimientoID,
		a.ActividadID,
		a.Porcentaje,
		a.Descripcion,
		a.UsuarioID,
	).Scan(&id)

	if err != nil {
		return 0, err
	}

	_, err = r.DB.Exec(`
		UPDATE mantenimiento
		SET
			porcentaje_avance = $1,
			actualizado_en = NOW()
		WHERE id = $2
	`, a.Porcentaje, mantenimientoID)

	return id, err
}

func (r *MantenimientoDetalleRepository) ListarAvances(
	mantenimientoID int,
) ([]MantenimientoAvance, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			actividad_id,
			porcentaje,
			descripcion,
			fecha,
			usuario_id
		FROM mantenimiento_avances
		WHERE mantenimiento_id = $1
		ORDER BY fecha ASC, id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoAvance

	for rows.Next() {
		var a MantenimientoAvance

		if err := rows.Scan(
			&a.ID,
			&a.MantenimientoID,
			&a.ActividadID,
			&a.Porcentaje,
			&a.Descripcion,
			&a.Fecha,
			&a.UsuarioID,
		); err != nil {
			return nil, err
		}

		lista = append(lista, a)
	}

	return lista, rows.Err()
}

// ============================================================
// PERSONAL
// ============================================================

type MantenimientoPersonal struct {
	ID              int      `json:"id"`
	MantenimientoID int      `json:"mantenimiento_id"`
	Nombre          string   `json:"nombre"`
	Cargo           *string  `json:"cargo"`
	Turno           *string  `json:"turno"`
	Horas           *float64 `json:"horas"`
	HH              *float64 `json:"hh"`
	Fecha           *string  `json:"fecha"`
}

func (r *MantenimientoDetalleRepository) CrearPersonal(
	mantenimientoID int,
	p MantenimientoPersonal,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_personal (
			mantenimiento_id,
			nombre,
			cargo,
			turno,
			horas,
			hh,
			fecha
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
		RETURNING id
	`,
		mantenimientoID,
		p.Nombre,
		p.Cargo,
		p.Turno,
		p.Horas,
		p.HH,
		p.Fecha,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoDetalleRepository) ListarPersonal(
	mantenimientoID int,
) ([]MantenimientoPersonal, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			nombre,
			cargo,
			turno,
			horas,
			hh,
			fecha
		FROM mantenimiento_personal
		WHERE mantenimiento_id = $1
		ORDER BY id
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoPersonal

	for rows.Next() {
		var p MantenimientoPersonal

		if err := rows.Scan(
			&p.ID,
			&p.MantenimientoID,
			&p.Nombre,
			&p.Cargo,
			&p.Turno,
			&p.Horas,
			&p.HH,
			&p.Fecha,
		); err != nil {
			return nil, err
		}

		lista = append(lista, p)
	}

	return lista, rows.Err()
}

// ============================================================
// HISTORIAL
// ============================================================

type MantenimientoHistorial struct {
	ID                 int      `json:"id"`
	MantenimientoID    int      `json:"mantenimiento_id"`
	TipoEvento         string   `json:"tipo_evento"`
	EstadoAnterior     *string  `json:"estado_anterior"`
	EstadoNuevo        *string  `json:"estado_nuevo"`
	FechaAnterior      *string  `json:"fecha_anterior"`
	FechaNueva         *string  `json:"fecha_nueva"`
	PorcentajeAnterior *float64 `json:"porcentaje_anterior"`
	PorcentajeNuevo    *float64 `json:"porcentaje_nuevo"`
	Descripcion        *string  `json:"descripcion"`
	UsuarioID          *int     `json:"usuario_id"`
	CreadoEn           string   `json:"creado_en"`
}

func (r *MantenimientoDetalleRepository) CrearHistorial(
	mantenimientoID int,
	h MantenimientoHistorial,
) (int, error) {
	var id int

	err := r.DB.QueryRow(`
		INSERT INTO mantenimiento_historial (
			mantenimiento_id,
			tipo_evento,
			estado_anterior,
			estado_nuevo,
			fecha_anterior,
			fecha_nueva,
			porcentaje_anterior,
			porcentaje_nuevo,
			descripcion,
			usuario_id
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		RETURNING id
	`,
		mantenimientoID,
		h.TipoEvento,
		h.EstadoAnterior,
		h.EstadoNuevo,
		h.FechaAnterior,
		h.FechaNueva,
		h.PorcentajeAnterior,
		h.PorcentajeNuevo,
		h.Descripcion,
		h.UsuarioID,
	).Scan(&id)

	return id, err
}

func (r *MantenimientoDetalleRepository) ListarHistorial(
	mantenimientoID int,
) ([]MantenimientoHistorial, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			mantenimiento_id,
			tipo_evento,
			estado_anterior,
			estado_nuevo,
			fecha_anterior,
			fecha_nueva,
			porcentaje_anterior,
			porcentaje_nuevo,
			descripcion,
			usuario_id,
			creado_en
		FROM mantenimiento_historial
		WHERE mantenimiento_id = $1
		ORDER BY creado_en ASC, id ASC
	`, mantenimientoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []MantenimientoHistorial

	for rows.Next() {
		var h MantenimientoHistorial

		if err := rows.Scan(
			&h.ID,
			&h.MantenimientoID,
			&h.TipoEvento,
			&h.EstadoAnterior,
			&h.EstadoNuevo,
			&h.FechaAnterior,
			&h.FechaNueva,
			&h.PorcentajeAnterior,
			&h.PorcentajeNuevo,
			&h.Descripcion,
			&h.UsuarioID,
			&h.CreadoEn,
		); err != nil {
			return nil, err
		}

		lista = append(lista, h)
	}

	return lista, rows.Err()
}
func (r *MantenimientoDetalleRepository) ActualizarActividad(
	id int,
	m MantenimientoActividad,
) error {
	result, err := r.DB.Exec(`
			UPDATE mantenimiento_actividades
			SET
				descripcion = $1,
				estado = $2,
				prioridad = $3,
				horas_planificadas = $4,
				horas_ejecutadas = $5,
				porcentaje = $6,
				fecha_inicio = $7,
				fecha_fin = $8
			WHERE id = $9
		`,
		m.Descripcion,
		m.Estado,
		m.Prioridad,
		m.HorasPlanificadas,
		m.HorasEjecutadas,
		m.Porcentaje,
		m.FechaInicio,
		m.FechaFin,
		id,
	)

	if err != nil {
		return err
	}

	filas, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if filas == 0 {
		return fmt.Errorf("actividad %d no encontrada", id)
	}

	return nil
}

func (r *MantenimientoDetalleRepository) ActualizarAvance(
	id int,
	m MantenimientoAvance,
) error {
	var mantenimientoID int

	err := r.DB.QueryRow(`
		SELECT mantenimiento_id
		FROM mantenimiento_avances
		WHERE id = $1
	`, id).Scan(&mantenimientoID)

	if err != nil {
		return err
	}

	_, err = r.DB.Exec(`
		UPDATE mantenimiento_avances
		SET
			actividad_id = $1,
			porcentaje = $2,
			descripcion = $3,
			usuario_id = $4
		WHERE id = $5
	`,
		m.ActividadID,
		m.Porcentaje,
		m.Descripcion,
		m.UsuarioID,
		id,
	)

	if err != nil {
		return err
	}

	_, err = r.DB.Exec(`
		UPDATE mantenimiento
		SET
			porcentaje_avance = $1,
			actualizado_en = NOW()
		WHERE id = $2
	`, m.Porcentaje, mantenimientoID)

	return err
}

func (r *MantenimientoDetalleRepository) ActualizarPersonal(
	id int,
	m MantenimientoPersonal,
) error {
	_, err := r.DB.Exec(`
		UPDATE mantenimiento_personal
		SET
			nombre = $1,
			cargo = $2,
			turno = $3,
			horas = $4,
			hh = $5,
			fecha = $6
		WHERE id = $7
	`,
		m.Nombre,
		m.Cargo,
		m.Turno,
		m.Horas,
		m.HH,
		m.Fecha,
		id,
	)

	return err
}
func (r *MantenimientoDetalleRepository) EliminarActividad(id int) error {
	_, err := r.DB.Exec(`
		DELETE FROM mantenimiento_actividades
		WHERE id = $1
	`, id)

	return err
}

func (r *MantenimientoDetalleRepository) EliminarAvance(id int) error {
	_, err := r.DB.Exec(`
		DELETE FROM mantenimiento_avances
		WHERE id = $1
	`, id)

	return err
}

func (r *MantenimientoDetalleRepository) EliminarPersonal(id int) error {
	_, err := r.DB.Exec(`
		DELETE FROM mantenimiento_personal
		WHERE id = $1
	`, id)

	return err
}
