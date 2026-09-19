package repository

import (
	"fmt"

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
                        COALESCE(e.area, ''),
                        COALESCE(e.tipo, ''),
                        e.estado_equipo,
                        CASE
                                WHEN pe.equipo_id IS NOT NULL THEN TRUE
                                ELSE FALSE
                        END AS relacionado
                FROM equipos e
                LEFT JOIN planta_equipos pe
                        ON pe.equipo_id = e.id
                        AND pe.subproceso_id = $1
                ORDER BY e.nombre
        `, subprocesoID)

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
			&item.Relacionado,
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

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer func() {
		_ = tx.Rollback()
	}()

	// Quitar las relaciones actuales de este subproceso.
	if _, err := tx.Exec(`
		DELETE FROM planta_equipos
		WHERE subproceso_id = $1
	`, subprocesoID); err != nil {
		return err
	}

	// Si no quedaron equipos seleccionados, ya está sincronizado.
	if len(equipoIDs) == 0 {
		return tx.Commit()
	}

	for _, equipoID := range equipoIDs {
		if equipoID <= 0 {
			return fmt.Errorf("equipo_id inválido")
		}

		if _, err := tx.Exec(`
			INSERT INTO planta_equipos (
				equipo_id,
				subproceso_id
			)
			VALUES ($1, $2)
			ON CONFLICT (equipo_id)
			DO UPDATE SET
				subproceso_id = EXCLUDED.subproceso_id,
				actualizado_en = NOW()
		`, equipoID, subprocesoID); err != nil {
			return err
		}
	}

	return tx.Commit()
}
