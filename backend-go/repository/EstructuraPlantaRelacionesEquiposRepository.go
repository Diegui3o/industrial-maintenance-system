package repository

import (
	"fmt"
	"strings"

	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarEquiposParaRelacionSubproceso(
	subprocesoID int,
) ([]models.Equipo, error) {
	if subprocesoID <= 0 {
		return nil, fmt.Errorf("subproceso_id inválido")
	}

	rows, err := r.DB.Query(`
		SELECT
			e.id,
			e.codigo,
			e.nombre,
			e.area,
			e.tipo,
			e.estado_equipo
		FROM equipos e
		ORDER BY e.nombre
	`)
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
			&item.EstadoEquipo,
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

func (r *EstructuraPlantaRepository) RelacionarEquiposConSubproceso(
	subprocesoID int,
	equipoIDs []int,
) error {
	if subprocesoID <= 0 {
		return fmt.Errorf("subproceso_id inválido")
	}

	if len(equipoIDs) == 0 {
		return fmt.Errorf("debe seleccionar al menos un equipo")
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	placeholders := make([]string, len(equipoIDs))
	args := make([]interface{}, 0, len(equipoIDs)+1)

	args = append(args, subprocesoID)

	for i, id := range equipoIDs {
		if id <= 0 {
			_ = tx.Rollback()
			return fmt.Errorf("equipo_id inválido")
		}

		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		INSERT INTO planta_equipos (
			equipo_id,
			subproceso_id
		)
		SELECT
			e.id,
			$1
		FROM equipos e
		WHERE e.id IN (%s)
		ON CONFLICT (equipo_id)
		DO UPDATE SET
			subproceso_id = EXCLUDED.subproceso_id,
			actualizado_en = NOW()
	`, strings.Join(placeholders, ", "))

	if _, err := tx.Exec(query, args...); err != nil {
		_ = tx.Rollback()
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}