package repository

import (
	"backend/models"
	"database/sql"
	"fmt"
)

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
	// PROCESO Ã¢â€ â€™ SUBPROCESO Ã¢â€ â€™ EQUIPO
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
	// SISTEMA Ã¢â€ â€™ SUBPROCESO Ã¢â€ â€™ EQUIPO
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
