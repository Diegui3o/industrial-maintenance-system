package repository

import (
	"backend/models"
	"database/sql"
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

	// Equipo
	equipoRepo := &EquipoRepository{DB: r.DB}

	equipo, err := equipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil {
		return nil, err
	}

	detalle.Equipo = equipo

	// Subproceso
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
	`, equipoID).Scan(
		&subproceso.ID,
		&subproceso.ProcesoID,
		&subproceso.Nombre,
		&subproceso.Descripcion,
		&subproceso.Activo,
	)

	if err == nil {
		detalle.Subproceso = &subproceso
	} else if err != sql.ErrNoRows {
		return nil, err
	}

	// Clasificaciones
	detalle.Clasificaciones, err =
		r.ListarClasificacionesPorEquipo(equipoID)

	if err != nil {
		return nil, err
	}

	// Sistemas
	detalle.Sistemas, err =
		r.ListarSistemasPorEquipo(equipoID)

	if err != nil {
		return nil, err
	}

	// Componentes
	componentes, err := r.ListarComponentes(equipoID)
	if err != nil {
		return nil, err
	}

	detalle.Componentes = componentes

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