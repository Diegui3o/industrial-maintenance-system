package repository

import (
	"backend/models"
)

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
		VALUES ($1, $2, TRUE)
		RETURNING id
	`,
		s.Nombre,
		s.Descripcion,
	).Scan(&s.ID)

	if err != nil {
		return err
	}

	s.Activo = true

	return nil
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
