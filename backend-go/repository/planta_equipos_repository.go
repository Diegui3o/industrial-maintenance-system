package repository

import (
	"backend/models"
)

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
