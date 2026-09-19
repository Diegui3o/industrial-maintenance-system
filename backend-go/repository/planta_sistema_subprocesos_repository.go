package repository

import (
	"backend/models"
)

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
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, TRUE)
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
