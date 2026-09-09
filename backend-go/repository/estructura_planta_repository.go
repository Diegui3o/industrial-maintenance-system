package repository

import (
	"backend/models"
	"database/sql"
    "fmt"
)

type EstructuraPlantaRepository struct {
	DB *sql.DB
}

func NewEstructuraPlantaRepository(db *sql.DB) *EstructuraPlantaRepository {
	return &EstructuraPlantaRepository{DB: db}
}

// ==================== PROCESOS ====================

func (r *EstructuraPlantaRepository) ListarProcesos() ([]models.ProcesoPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, activo
		FROM procesos_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ProcesoPlanta

	for rows.Next() {
		var p models.ProcesoPlanta

		if err := rows.Scan(
			&p.ID,
			&p.Nombre,
			&p.Descripcion,
			&p.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, p)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearProceso(p *models.ProcesoPlanta) error {
	err := r.DB.QueryRow(`
		INSERT INTO procesos_planta (
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3)
		RETURNING id
	`,
		p.Nombre,
		p.Descripcion,
		p.Activo,
	).Scan(&p.ID)

	return err
}

// ==================== SUBPROCESOS ====================

func (r *EstructuraPlantaRepository) ListarSubprocesos(procesoID int) ([]models.SubprocesoPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, proceso_id, nombre, descripcion, activo
		FROM subprocesos_planta
		WHERE proceso_id = $1
		  AND activo = TRUE
		ORDER BY nombre
	`, procesoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubprocesoPlanta

	for rows.Next() {
		var s models.SubprocesoPlanta

		if err := rows.Scan(
			&s.ID,
			&s.ProcesoID,
			&s.Nombre,
			&s.Descripcion,
			&s.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, s)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearSubproceso(s *models.SubprocesoPlanta) error {
	err := r.DB.QueryRow(`
		INSERT INTO subprocesos_planta (
			proceso_id,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`,
		s.ProcesoID,
		s.Nombre,
		s.Descripcion,
		s.Activo,
	).Scan(&s.ID)

	return err
}

// ==================== EQUIPO → SUBPROCESO ====================

func (r *EstructuraPlantaRepository) AsignarEquipoSubproceso(
	equipoID int,
	subprocesoID int,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO planta_equipos (
			equipo_id,
			subproceso_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id)
		DO UPDATE SET
			subproceso_id = EXCLUDED.subproceso_id,
			actualizado_en = NOW()
	`,
		equipoID,
		subprocesoID,
	)

	return err
}

func (r *EstructuraPlantaRepository) ObtenerSubprocesoEquipo(
	equipoID int,
) (*models.PlantaEquipo, error) {
	var p models.PlantaEquipo

	err := r.DB.QueryRow(`
		SELECT equipo_id, subproceso_id
		FROM planta_equipos
		WHERE equipo_id = $1
	`, equipoID).Scan(
		&p.EquipoID,
		&p.SubprocesoID,
	)

	if err != nil {
		return nil, err
	}

	return &p, nil
}

// ==================== CLASIFICACIONES ====================

func (r *EstructuraPlantaRepository) ListarClasificaciones() ([]models.ClasificacionPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, activo
		FROM clasificaciones_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ClasificacionPlanta

	for rows.Next() {
		var c models.ClasificacionPlanta

		if err := rows.Scan(
			&c.ID,
			&c.Nombre,
			&c.Descripcion,
			&c.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, c)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearClasificacion(
	c *models.ClasificacionPlanta,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO clasificaciones_planta (
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3)
		RETURNING id
	`,
		c.Nombre,
		c.Descripcion,
		c.Activo,
	).Scan(&c.ID)

	return err
}

func (r *EstructuraPlantaRepository) AsignarClasificacion(
	equipoID int,
	clasificacionID int,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO equipo_clasificacion_planta (
			equipo_id,
			clasificacion_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id, clasificacion_id)
		DO NOTHING
	`,
		equipoID,
		clasificacionID,
	)

	return err
}

// ==================== SISTEMAS ====================

func (r *EstructuraPlantaRepository) ListarSistemas() ([]models.SistemaPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, activo
		FROM sistemas_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SistemaPlanta

	for rows.Next() {
		var s models.SistemaPlanta

		if err := rows.Scan(
			&s.ID,
			&s.Nombre,
			&s.Descripcion,
			&s.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, s)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearSistema(
	s *models.SistemaPlanta,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO sistemas_planta (
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3)
		RETURNING id
	`,
		s.Nombre,
		s.Descripcion,
		s.Activo,
	).Scan(&s.ID)

	return err
}

func (r *EstructuraPlantaRepository) AsignarSistema(
	equipoID int,
	sistemaID int,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO equipo_sistema_planta (
			equipo_id,
			sistema_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id, sistema_id)
		DO NOTHING
	`,
		equipoID,
		sistemaID,
	)

	return err
}

// ==================== COMPONENTES ====================

func (r *EstructuraPlantaRepository) ListarComponentes(
	equipoID int,
) ([]models.ComponenteEquipo, error) {
	rows, err := r.DB.Query(`
		SELECT id, equipo_id, codigo, nombre, descripcion, activo
		FROM componentes_equipo
		WHERE equipo_id = $1
		  AND activo = TRUE
		ORDER BY nombre
	`, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ComponenteEquipo

	for rows.Next() {
		var c models.ComponenteEquipo

		if err := rows.Scan(
			&c.ID,
			&c.EquipoID,
			&c.Codigo,
			&c.Nombre,
			&c.Descripcion,
			&c.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, c)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearComponente(
	c *models.ComponenteEquipo,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO componentes_equipo (
			equipo_id,
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`,
		c.EquipoID,
		c.Codigo,
		c.Nombre,
		c.Descripcion,
		c.Activo,
	).Scan(&c.ID)

	return err
}

// ==================== REPUESTOS ====================

func (r *EstructuraPlantaRepository) ListarRepuestos() ([]models.Repuesto, error) {
	rows, err := r.DB.Query(`
		SELECT id, codigo, nombre, descripcion, activo
		FROM repuestos
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.Repuesto

	for rows.Next() {
		var r models.Repuesto

		if err := rows.Scan(
			&r.ID,
			&r.Codigo,
			&r.Nombre,
			&r.Descripcion,
			&r.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, r)
	}

	return resultado, rows.Err()
}

func (r *EstructuraPlantaRepository) CrearRepuesto(
	rep *models.Repuesto,
) error {
	err := r.DB.QueryRow(`
		INSERT INTO repuestos (
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
		rep.Activo,
	).Scan(&rep.ID)

	return err
}

func (r *EstructuraPlantaRepository) AsignarRepuestoComponente(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO componente_repuesto (
			componente_id,
			repuesto_id,
			cantidad,
			posicion,
			notas
		)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (componente_id, repuesto_id)
		DO UPDATE SET
			cantidad = EXCLUDED.cantidad,
			posicion = EXCLUDED.posicion,
			notas = EXCLUDED.notas,
			actualizado_en = NOW()
	`,
		componenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)

	return err
}

// ==================== ACTUALIZACIONES ====================

func (r *EstructuraPlantaRepository) ActualizarProceso(
	id int,
	p models.ProcesoPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE procesos_planta
		SET nombre = $1,
		    descripcion = $2,
		    activo = $3,
		    actualizado_en = NOW()
		WHERE id = $4
	`,
		p.Nombre,
		p.Descripcion,
		p.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarSubproceso(
	id int,
	s models.SubprocesoPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE subprocesos_planta
		SET proceso_id = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		s.ProcesoID,
		s.Nombre,
		s.Descripcion,
		s.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarClasificacion(
	id int,
	c models.ClasificacionPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE clasificaciones_planta
		SET nombre = $1,
		    descripcion = $2,
		    activo = $3,
		    actualizado_en = NOW()
		WHERE id = $4
	`,
		c.Nombre,
		c.Descripcion,
		c.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarSistema(
	id int,
	s models.SistemaPlanta,
) error {
	_, err := r.DB.Exec(`
		UPDATE sistemas_planta
		SET nombre = $1,
		    descripcion = $2,
		    activo = $3,
		    actualizado_en = NOW()
		WHERE id = $4
	`,
		s.Nombre,
		s.Descripcion,
		s.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarComponente(
	id int,
	c models.ComponenteEquipo,
) error {
	_, err := r.DB.Exec(`
		UPDATE componentes_equipo
		SET codigo = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		c.Codigo,
		c.Nombre,
		c.Descripcion,
		c.Activo,
		id,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarRepuesto(
	id int,
	rep models.Repuesto,
) error {
	_, err := r.DB.Exec(`
		UPDATE repuestos
		SET codigo = $1,
		    nombre = $2,
		    descripcion = $3,
		    activo = $4,
		    actualizado_en = NOW()
		WHERE id = $5
	`,
		rep.Codigo,
		rep.Nombre,
		rep.Descripcion,
		rep.Activo,
		id,
	)

	return err
}

// ==================== ACTUALIZAR RELACIONES ====================

func (r *EstructuraPlantaRepository) ActualizarEquipoSubproceso(
	equipoID int,
	subprocesoID int,
) error {
	_, err := r.DB.Exec(`
		INSERT INTO planta_equipos (equipo_id, subproceso_id)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id)
		DO UPDATE SET
			subproceso_id = EXCLUDED.subproceso_id,
			actualizado_en = NOW()
	`,
		equipoID,
		subprocesoID,
	)

	return err
}

func (r *EstructuraPlantaRepository) ActualizarEquipoClasificaciones(
	equipoID int,
	clasificaciones []int,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		DELETE FROM equipo_clasificacion_planta
		WHERE equipo_id = $1
	`, equipoID)

	if err != nil {
		return err
	}

	for _, clasificacionID := range clasificaciones {
		_, err = tx.Exec(`
			INSERT INTO equipo_clasificacion_planta (
				equipo_id,
				clasificacion_id
			)
			VALUES ($1, $2)
		`,
			equipoID,
			clasificacionID,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *EstructuraPlantaRepository) ActualizarEquipoSistemas(
	equipoID int,
	sistemas []int,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		DELETE FROM equipo_sistema_planta
		WHERE equipo_id = $1
	`, equipoID)

	if err != nil {
		return err
	}

	for _, sistemaID := range sistemas {
		_, err = tx.Exec(`
			INSERT INTO equipo_sistema_planta (
				equipo_id,
				sistema_id
			)
			VALUES ($1, $2)
		`,
			equipoID,
			sistemaID,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *EstructuraPlantaRepository) ActualizarComponenteRepuestos(
	componenteID int,
	repuestos []int,
) error {

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		DELETE FROM componente_repuesto
		WHERE componente_id = $1
	`, componenteID)

	if err != nil {
		return err
	}

	for _, repuestoID := range repuestos {
		_, err = tx.Exec(`
			INSERT INTO componente_repuesto (
				componente_id,
				repuesto_id
			)
			VALUES ($1, $2)
		`,
			componenteID,
			repuestoID,
		)

		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// ==================== CONSULTAR RELACIONES ====================

func (r *EstructuraPlantaRepository) ListarEquiposPorSubproceso(
	subprocesoID int,
) ([]models.PlantaEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT equipo_id, subproceso_id
		FROM planta_equipos
		WHERE subproceso_id = $1
		ORDER BY equipo_id
	`, subprocesoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.PlantaEquipo

	for rows.Next() {
		var p models.PlantaEquipo

		if err := rows.Scan(
			&p.EquipoID,
			&p.SubprocesoID,
		); err != nil {
			return nil, err
		}

		lista = append(lista, p)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarClasificacionesPorEquipo(
	equipoID int,
) ([]models.ClasificacionPlanta, error) {

	rows, err := r.DB.Query(`
		SELECT
			c.id,
			c.nombre,
			c.descripcion,
			c.activo
		FROM clasificaciones_planta c
		INNER JOIN equipo_clasificacion_planta ec
			ON ec.clasificacion_id = c.id
		WHERE ec.equipo_id = $1
		ORDER BY c.nombre
	`, equipoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.ClasificacionPlanta

	for rows.Next() {
		var c models.ClasificacionPlanta

		if err := rows.Scan(
			&c.ID,
			&c.Nombre,
			&c.Descripcion,
			&c.Activo,
		); err != nil {
			return nil, err
		}

		lista = append(lista, c)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarSistemasPorEquipo(
	equipoID int,
) ([]models.SistemaPlanta, error) {

	rows, err := r.DB.Query(`
		SELECT
			s.id,
			s.nombre,
			s.descripcion,
			s.activo
		FROM sistemas_planta s
		INNER JOIN equipo_sistema_planta es
			ON es.sistema_id = s.id
		WHERE es.equipo_id = $1
		ORDER BY s.nombre
	`, equipoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.SistemaPlanta

	for rows.Next() {
		var s models.SistemaPlanta

		if err := rows.Scan(
			&s.ID,
			&s.Nombre,
			&s.Descripcion,
			&s.Activo,
		); err != nil {
			return nil, err
		}

		lista = append(lista, s)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ListarRepuestosPorComponente(
	componenteID int,
) ([]models.Repuesto, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			r.descripcion,
			r.activo
		FROM repuestos r
		INNER JOIN componente_repuesto cr
			ON cr.repuesto_id = r.id
		WHERE cr.componente_id = $1
		ORDER BY r.nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Repuesto

	for rows.Next() {
		var rep models.Repuesto

		if err := rows.Scan(
			&rep.ID,
			&rep.Codigo,
			&rep.Nombre,
			&rep.Descripcion,
			&rep.Activo,
		); err != nil {
			return nil, err
		}

		lista = append(lista, rep)
	}

	return lista, rows.Err()
}

func (r *EstructuraPlantaRepository) ObtenerEquipoPlantaDetalle(
	equipoID int,
) (*models.EquipoPlantaDetalle, error) {

	detalle := &models.EquipoPlantaDetalle{
		Clasificaciones: []models.ClasificacionPlanta{},
		Sistemas:        []models.SistemaPlanta{},
		Componentes:     []models.ComponenteEquipo{},
	}

	// =========================================================
	// EQUIPO
	// =========================================================

	equipo := &models.Equipo{}

	var (
		fase             sql.NullString
		fabricante       sql.NullString
		modelo           sql.NullString
		numeroSerie      sql.NullString
		faseUbicacion    sql.NullString
		areaFuncional    sql.NullString
		fechaInstalacion sql.NullTime
		actualizadoEn    sql.NullTime
	)

	err := r.DB.QueryRow(`
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			e.fase_ubicacion,
			e.area_funcional
		FROM equipos e
		WHERE e.id = $1
	`,
		equipoID,
	).Scan(
		&equipo.ID,
		&equipo.Codigo,
		&equipo.Nombre,
		&equipo.Area,
		&equipo.Tipo,
		&fase,
		&fabricante,
		&modelo,
		&numeroSerie,
		&equipo.Critico,
		&equipo.EstadoEquipo,
		&fechaInstalacion,
		&equipo.FechaCreacion,
		&actualizadoEn,
		&faseUbicacion,
		&areaFuncional,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("equipo no encontrado")
	}

	if err != nil {
		return nil, err
	}

	equipo.Fase = fase.String
	equipo.Fabricante = fabricante.String
	equipo.Modelo = modelo.String
	equipo.NumeroSerie = numeroSerie.String
	equipo.FaseUbicacion = faseUbicacion.String
	equipo.AreaFuncional = areaFuncional.String

	if fechaInstalacion.Valid {
		equipo.FechaInstalacion = &fechaInstalacion.Time
	}

	if actualizadoEn.Valid {
		equipo.ActualizadoEn = &actualizadoEn.Time
	}

	detalle.Equipo = equipo

	// =========================================================
	// PROCESO → SUBPROCESO → EQUIPO
	// =========================================================

	var subproceso models.SubprocesoPlanta

	err = r.DB.QueryRow(`
		SELECT
			s.id,
			s.proceso_id,
			s.nombre,
			s.descripcion,
			s.activo
		FROM subprocesos_planta s
		INNER JOIN planta_equipos pe
			ON pe.subproceso_id = s.id
		WHERE pe.equipo_id = $1
	`,
		equipoID,
	).Scan(
		&subproceso.ID,
		&subproceso.ProcesoID,
		&subproceso.Nombre,
		&subproceso.Descripcion,
		&subproceso.Activo,
	)

	if err == nil {
		detalle.Subproceso = &subproceso

		// =====================================================
		// PROCESO PADRE
		// =====================================================

		proceso := &models.ProcesoPlanta{}

		err = r.DB.QueryRow(`
			SELECT
				id,
				nombre,
				descripcion,
				activo
			FROM procesos_planta
			WHERE id = $1
		`,
			subproceso.ProcesoID,
		).Scan(
			&proceso.ID,
			&proceso.Nombre,
			&proceso.Descripcion,
			&proceso.Activo,
		)

		if err != nil {
			return nil, err
		}

		detalle.Proceso = proceso

	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// =========================================================
	// SISTEMA → SUBPROCESO → EQUIPO
	// =========================================================

	var subprocesoSistema models.SubprocesoSistemaPlanta

	err = r.DB.QueryRow(`
		SELECT
			ss.id,
			ss.sistema_id,
			ss.nombre,
			ss.descripcion,
			ss.activo
		FROM subprocesos_sistema_planta ss
		INNER JOIN sistema_planta_equipos spe
			ON spe.subproceso_sistema_id = ss.id
		WHERE spe.equipo_id = $1
	`,
		equipoID,
	).Scan(
		&subprocesoSistema.ID,
		&subprocesoSistema.SistemaID,
		&subprocesoSistema.Nombre,
		&subprocesoSistema.Descripcion,
		&subprocesoSistema.Activo,
	)

	if err == nil {
		detalle.SubprocesoSistema = &subprocesoSistema

		// =====================================================
		// SISTEMA PADRE
		// =====================================================

		sistema := &models.SistemaPlanta{}

		err = r.DB.QueryRow(`
			SELECT
				id,
				nombre,
				descripcion,
				activo
			FROM sistemas_planta
			WHERE id = $1
		`,
			subprocesoSistema.SistemaID,
		).Scan(
			&sistema.ID,
			&sistema.Nombre,
			&sistema.Descripcion,
			&sistema.Activo,
		)

		if err != nil {
			return nil, err
		}

		detalle.Sistema = sistema

	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// =========================================================
	// CLASIFICACIONES
	// =========================================================

	rowsClasificaciones, err := r.DB.Query(`
		SELECT
			c.id,
			c.nombre,
			c.descripcion,
			c.activo
		FROM clasificaciones_planta c
		INNER JOIN equipo_clasificacion_planta ec
			ON ec.clasificacion_id = c.id
		WHERE ec.equipo_id = $1
		ORDER BY c.nombre
	`,
		equipoID,
	)

	if err != nil {
		return nil, err
	}

	for rowsClasificaciones.Next() {

		var clasificacion models.ClasificacionPlanta

		if err := rowsClasificaciones.Scan(
			&clasificacion.ID,
			&clasificacion.Nombre,
			&clasificacion.Descripcion,
			&clasificacion.Activo,
		); err != nil {
			rowsClasificaciones.Close()
			return nil, err
		}

		detalle.Clasificaciones = append(
			detalle.Clasificaciones,
			clasificacion,
		)
	}

	if err := rowsClasificaciones.Err(); err != nil {
		rowsClasificaciones.Close()
		return nil, err
	}

	rowsClasificaciones.Close()

	// =========================================================
	// SISTEMAS ASOCIADOS
	// =========================================================

	rowsSistemas, err := r.DB.Query(`
		SELECT
			s.id,
			s.nombre,
			s.descripcion,
			s.activo
		FROM sistemas_planta s
		INNER JOIN equipo_sistema_planta es
			ON es.sistema_id = s.id
		WHERE es.equipo_id = $1
		ORDER BY s.nombre
	`,
		equipoID,
	)

	if err != nil {
		return nil, err
	}

	for rowsSistemas.Next() {

		var sistema models.SistemaPlanta

		if err := rowsSistemas.Scan(
			&sistema.ID,
			&sistema.Nombre,
			&sistema.Descripcion,
			&sistema.Activo,
		); err != nil {
			rowsSistemas.Close()
			return nil, err
		}

		detalle.Sistemas = append(
			detalle.Sistemas,
			sistema,
		)
	}

	if err := rowsSistemas.Err(); err != nil {
		rowsSistemas.Close()
		return nil, err
	}

	rowsSistemas.Close()

	// =========================================================
	// COMPONENTES
	// =========================================================

	rowsComponentes, err := r.DB.Query(`
		SELECT
			id,
			equipo_id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM componentes_equipo
		WHERE equipo_id = $1
		ORDER BY nombre
	`,
		equipoID,
	)

	if err != nil {
		return nil, err
	}

	for rowsComponentes.Next() {

		var componente models.ComponenteEquipo

		if err := rowsComponentes.Scan(
			&componente.ID,
			&componente.EquipoID,
			&componente.Codigo,
			&componente.Nombre,
			&componente.Descripcion,
			&componente.Activo,
		); err != nil {
			rowsComponentes.Close()
			return nil, err
		}

		detalle.Componentes = append(
			detalle.Componentes,
			componente,
		)
	}

	if err := rowsComponentes.Err(); err != nil {
		rowsComponentes.Close()
		return nil, err
	}

	rowsComponentes.Close()

	return detalle, nil
}
func (r *EstructuraPlantaRepository) ListarRepuestosDetallePorComponente(
	componenteID int,
) ([]models.ComponenteRepuestoDetalle, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			cr.cantidad,
			cr.posicion,
			cr.notas
		FROM componente_repuesto cr
		INNER JOIN repuestos r
			ON r.id = cr.repuesto_id
		WHERE cr.componente_id = $1
		ORDER BY r.nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.ComponenteRepuestoDetalle

	for rows.Next() {
		var item models.ComponenteRepuestoDetalle
		var codigo sql.NullString
		var posicion sql.NullString
		var notas sql.NullString

		err := rows.Scan(
			&item.RepuestoID,
			&codigo,
			&item.Nombre,
			&item.Cantidad,
			&posicion,
			&notas,
		)

		if err != nil {
			return nil, err
		}

		if codigo.Valid {
			item.Codigo = &codigo.String
		}

		if posicion.Valid {
			item.Posicion = &posicion.String
		}

		if notas.Valid {
			item.Notas = &notas.String
		}

		lista = append(lista, item)
	}

	return lista, rows.Err()
}
func (r *EstructuraPlantaRepository) ActualizarComponenteRepuesto(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {

	_, err := r.DB.Exec(`
		UPDATE componente_repuesto
		SET
			cantidad = $1,
			posicion = $2,
			notas = $3,
			actualizado_en = NOW()
		WHERE componente_id = $4
		  AND repuesto_id = $5
	`,
		cantidad,
		posicion,
		notas,
		componenteID,
		repuestoID,
	)

	return err
}
func (r *EstructuraPlantaRepository) ActualizarAsignacionRepuesto(
	componenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {
	_, err := r.DB.Exec(`
		UPDATE componente_repuesto
		SET
			cantidad = $1,
			posicion = $2,
			notas = $3,
			actualizado_en = NOW()
		WHERE componente_id = $4
		  AND repuesto_id = $5
	`,
		cantidad,
		posicion,
		notas,
		componenteID,
		repuestoID,
	)

	return err
}
func (r *EstructuraPlantaRepository) ListarEquiposSinUbicar() ([]models.Equipo, error) {
	rows, err := r.DB.Query(`
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			COALESCE(d.ip, '') AS ip,
			COALESCE(e.fase_ubicacion, '') AS fase_ubicacion,
			COALESCE(e.area_funcional, '') AS area_funcional
		FROM equipos e
		LEFT JOIN dispositivos_red d
			ON d.equipo_id = e.id
		LEFT JOIN planta_equipos pe
			ON pe.equipo_id = e.id
		LEFT JOIN sistema_planta_equipos spe
			ON spe.equipo_id = e.id
		WHERE pe.equipo_id IS NULL
		  AND spe.equipo_id IS NULL
		ORDER BY e.codigo
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var equipos []models.Equipo

	for rows.Next() {
		var equipo models.Equipo

		if err := rows.Scan(
			&equipo.ID,
			&equipo.Codigo,
			&equipo.Nombre,
			&equipo.Area,
			&equipo.Tipo,
			&equipo.Fase,
			&equipo.Fabricante,
			&equipo.Modelo,
			&equipo.NumeroSerie,
			&equipo.Critico,
			&equipo.EstadoEquipo,
			&equipo.FechaInstalacion,
			&equipo.FechaCreacion,
			&equipo.ActualizadoEn,
			&equipo.IP,
			&equipo.FaseUbicacion,
			&equipo.AreaFuncional,
		); err != nil {
			return nil, err
		}

		equipos = append(equipos, equipo)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return equipos, nil
}
func (r *EstructuraPlantaRepository) ListarSubprocesosSistema(
	sistemaID int,
) ([]models.SubprocesoSistemaPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			sistema_id,
			nombre,
			descripcion,
			activo
		FROM subprocesos_sistema_planta
		WHERE sistema_id = $1
		ORDER BY nombre
	`, sistemaID)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var resultado []models.SubprocesoSistemaPlanta

	for rows.Next() {
		var item models.SubprocesoSistemaPlanta

		if err := rows.Scan(
			&item.ID,
			&item.SistemaID,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) CrearSubprocesoSistema(
	item models.SubprocesoSistemaPlanta,
) (models.SubprocesoSistemaPlanta, error) {
	err := r.DB.QueryRow(`
		INSERT INTO subprocesos_sistema_planta (
			sistema_id,
			nombre,
			descripcion
		)
		VALUES ($1, $2, $3)
		RETURNING id, sistema_id, nombre, descripcion, activo
	`,
		item.SistemaID,
		item.Nombre,
		item.Descripcion,
	).Scan(
		&item.ID,
		&item.SistemaID,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}

func (r *EstructuraPlantaRepository) ActualizarSubprocesoSistema(
	item models.SubprocesoSistemaPlanta,
) (models.SubprocesoSistemaPlanta, error) {
	err := r.DB.QueryRow(`
		UPDATE subprocesos_sistema_planta
		SET
			sistema_id = $1,
			nombre = $2,
			descripcion = $3,
			activo = $4,
			actualizado_en = NOW()
		WHERE id = $5
		RETURNING id, sistema_id, nombre, descripcion, activo
	`,
		item.SistemaID,
		item.Nombre,
		item.Descripcion,
		item.Activo,
		item.ID,
	).Scan(
		&item.ID,
		&item.SistemaID,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}
func (r *EstructuraPlantaRepository) ListarSubcomponentes(
	componenteID int,
) ([]models.SubcomponenteEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM subcomponentes_equipo
		WHERE componente_id = $1
		ORDER BY nombre
	`, componenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubcomponenteEquipo

	for rows.Next() {
		var item models.SubcomponenteEquipo

		if err := rows.Scan(
			&item.ID,
			&item.ComponenteID,
			&item.Codigo,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) CrearSubcomponente(
	item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {

	err := r.DB.QueryRow(`
		INSERT INTO subcomponentes_equipo (
			componente_id,
			codigo,
			nombre,
			descripcion
		)
		VALUES ($1, $2, $3, $4)
		RETURNING
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
	`,
		item.ComponenteID,
		item.Codigo,
		item.Nombre,
		item.Descripcion,
	).Scan(
		&item.ID,
		&item.ComponenteID,
		&item.Codigo,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}

func (r *EstructuraPlantaRepository) ActualizarSubcomponente(
	item models.SubcomponenteEquipo,
) (models.SubcomponenteEquipo, error) {

	err := r.DB.QueryRow(`
		UPDATE subcomponentes_equipo
		SET
			componente_id = $1,
			codigo = $2,
			nombre = $3,
			descripcion = $4,
			activo = $5,
			actualizado_en = NOW()
		WHERE id = $6
		RETURNING
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
	`,
		item.ComponenteID,
		item.Codigo,
		item.Nombre,
		item.Descripcion,
		item.Activo,
		item.ID,
	).Scan(
		&item.ID,
		&item.ComponenteID,
		&item.Codigo,
		&item.Nombre,
		&item.Descripcion,
		&item.Activo,
	)

	return item, err
}
func (r *EstructuraPlantaRepository) ListarRepuestosSubcomponente(
	subcomponenteID int,
) ([]models.SubcomponenteRepuestoDetalle, error) {

	rows, err := r.DB.Query(`
		SELECT
			r.id,
			r.codigo,
			r.nombre,
			sr.cantidad,
			sr.posicion,
			sr.notas
		FROM subcomponente_repuesto sr
		INNER JOIN repuestos r
			ON r.id = sr.repuesto_id
		WHERE sr.subcomponente_id = $1
		ORDER BY r.nombre
	`, subcomponenteID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubcomponenteRepuestoDetalle

	for rows.Next() {
		var item models.SubcomponenteRepuestoDetalle

		if err := rows.Scan(
			&item.RepuestoID,
			&item.Codigo,
			&item.Nombre,
			&item.Cantidad,
			&item.Posicion,
			&item.Notas,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) AsignarRepuestoSubcomponente(
	subcomponenteID int,
	repuestoID int,
	cantidad float64,
	posicion *string,
	notas *string,
) error {

	_, err := r.DB.Exec(`
		INSERT INTO subcomponente_repuesto (
			subcomponente_id,
			repuesto_id,
			cantidad,
			posicion,
			notas
		)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (subcomponente_id, repuesto_id)
		DO UPDATE SET
			cantidad = EXCLUDED.cantidad,
			posicion = EXCLUDED.posicion,
			notas = EXCLUDED.notas,
			actualizado_en = NOW()
	`,
		subcomponenteID,
		repuestoID,
		cantidad,
		posicion,
		notas,
	)

	return err
}
func (r *EstructuraPlantaRepository) ListarEquiposPorSubprocesoSistema(
	subprocesoSistemaID int,
) ([]models.Equipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			COALESCE(d.ip, ''),
			COALESCE(e.fase_ubicacion, ''),
			COALESCE(e.area_funcional, '')
		FROM sistema_planta_equipos spe
		INNER JOIN equipos e
			ON e.id = spe.equipo_id
		LEFT JOIN dispositivos_red d
			ON d.equipo_id = e.id
		WHERE spe.subproceso_sistema_id = $1
		ORDER BY e.nombre
	`, subprocesoSistemaID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.Equipo

	for rows.Next() {
		var item models.Equipo

		if err := rows.Scan(
			&item.ID,
			&item.Codigo,
			&item.Nombre,
			&item.Area,
			&item.Tipo,
			&item.Fase,
			&item.Fabricante,
			&item.Modelo,
			&item.NumeroSerie,
			&item.Critico,
			&item.EstadoEquipo,
			&item.FechaInstalacion,
			&item.FechaCreacion,
			&item.ActualizadoEn,
			&item.IP,
			&item.FaseUbicacion,
			&item.AreaFuncional,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) AsignarEquipoSubprocesoSistema(
	equipoID int,
	subprocesoSistemaID int,
) error {

	_, err := r.DB.Exec(`
		INSERT INTO sistema_planta_equipos (
			equipo_id,
			subproceso_sistema_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id)
		DO UPDATE SET
			subproceso_sistema_id = EXCLUDED.subproceso_sistema_id,
			actualizado_en = NOW()
	`,
		equipoID,
		subprocesoSistemaID,
	)

	return err
}
func (r *EstructuraPlantaRepository) ListarEquiposDisponiblesSistema() ([]models.Equipo, error) {
	rows, err := r.DB.Query(`
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.fase,
			e.fabricante,
			e.modelo,
			e.numero_serie,
			e.critico,
			e.estado_equipo,
			e.fecha_instalacion,
			e.fecha_creacion,
			e.actualizado_en,
			COALESCE(d.ip, '') AS ip,
			COALESCE(e.fase_ubicacion, '') AS fase_ubicacion,
			COALESCE(e.area_funcional, '') AS area_funcional
		FROM equipos e
		LEFT JOIN dispositivos_red d
			ON d.equipo_id = e.id
		LEFT JOIN planta_equipos pe
			ON pe.equipo_id = e.id
		LEFT JOIN sistema_planta_equipos spe
			ON spe.equipo_id = e.id
		WHERE pe.equipo_id IS NULL
		  AND spe.equipo_id IS NULL
		ORDER BY e.codigo
	`)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var equipos []models.Equipo

	for rows.Next() {
		var equipo models.Equipo

		if err := rows.Scan(
			&equipo.ID,
			&equipo.Codigo,
			&equipo.Nombre,
			&equipo.Area,
			&equipo.Tipo,
			&equipo.Fase,
			&equipo.Fabricante,
			&equipo.Modelo,
			&equipo.NumeroSerie,
			&equipo.Critico,
			&equipo.EstadoEquipo,
			&equipo.FechaInstalacion,
			&equipo.FechaCreacion,
			&equipo.ActualizadoEn,
			&equipo.IP,
			&equipo.FaseUbicacion,
			&equipo.AreaFuncional,
		); err != nil {
			return nil, err
		}

		equipos = append(equipos, equipo)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return equipos, nil
}