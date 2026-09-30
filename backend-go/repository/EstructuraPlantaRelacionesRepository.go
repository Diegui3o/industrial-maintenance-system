package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"backend/models"
)

// ListarTodosSubprocesosPlanta devuelve todos los subprocesos activos.
func (r *EstructuraPlantaRepository) ListarTodosSubprocesosPlanta() ([]models.SubprocesoPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			proceso_id,
			nombre,
			descripcion,
			activo
		FROM subprocesos_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.SubprocesoPlanta

	for rows.Next() {
		var item models.SubprocesoPlanta
		var procesoID sql.NullInt64

		if err := rows.Scan(
			&item.ID,
			&procesoID,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		if procesoID.Valid {
			id := int(procesoID.Int64)
			item.ProcesoID = &id
		} else {
			item.ProcesoID = nil
		}

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}

func (r *EstructuraPlantaRepository) RelacionarSubprocesosConProceso(
	procesoID int,
	subprocesoIDs []int,
) error {
	if procesoID <= 0 {
		return fmt.Errorf("proceso_id inválido")
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var queryDesasignar string

	if len(subprocesoIDs) == 0 {
		queryDesasignar = `
			UPDATE subprocesos_planta
			SET
				proceso_id = NULL,
				actualizado_en = NOW()
			WHERE proceso_id = $1
			  AND activo = TRUE
		`

		if _, err := tx.Exec(queryDesasignar, procesoID); err != nil {
			return err
		}
	} else {
		placeholders := make([]string, len(subprocesoIDs))
		args := make([]interface{}, 0, len(subprocesoIDs)+1)

		args = append(args, procesoID)

		for i, id := range subprocesoIDs {
			if id <= 0 {
				return fmt.Errorf("subproceso_id inválido")
			}

			placeholders[i] = fmt.Sprintf("$%d", i+2)
			args = append(args, id)
		}

		queryDesasignar = fmt.Sprintf(`
			UPDATE subprocesos_planta
			SET
				proceso_id = NULL,
				actualizado_en = NOW()
			WHERE proceso_id = $1
			  AND activo = TRUE
			  AND id NOT IN (%s)
		`, strings.Join(placeholders, ", "))

		if _, err := tx.Exec(queryDesasignar, args...); err != nil {
			return err
		}
	}

	if len(subprocesoIDs) > 0 {
		placeholders := make([]string, len(subprocesoIDs))
		args := make([]interface{}, 0, len(subprocesoIDs)+1)

		args = append(args, procesoID)

		for i, id := range subprocesoIDs {
			if id <= 0 {
				return fmt.Errorf("subproceso_id inválido")
			}

			placeholders[i] = fmt.Sprintf("$%d", i+2)
			args = append(args, id)
		}

		queryAsignar := fmt.Sprintf(`
			UPDATE subprocesos_planta
			SET
				proceso_id = $1,
				actualizado_en = NOW()
			WHERE id IN (%s)
			  AND activo = TRUE
		`, strings.Join(placeholders, ", "))

		if _, err := tx.Exec(queryAsignar, args...); err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}