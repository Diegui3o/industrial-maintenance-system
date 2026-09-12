package repository

import (
	"fmt"
	"strings"

	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarComponentesParaRelacionEquipo(
	equipoID int,
) ([]models.ComponenteEquipo, error) {
	if equipoID <= 0 {
		return nil, fmt.Errorf("equipo_id inválido")
	}

	rows, err := r.DB.Query(`
		SELECT
			id,
			equipo_id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM componentes_equipo
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.ComponenteEquipo

	for rows.Next() {
		var item models.ComponenteEquipo

		if err := rows.Scan(
			&item.ID,
			&item.EquipoID,
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

func (r *EstructuraPlantaRepository) RelacionarComponentesConEquipo(
	equipoID int,
	componenteIDs []int,
) error {
	if equipoID <= 0 {
		return fmt.Errorf("equipo_id inválido")
	}

	if len(componenteIDs) == 0 {
		return fmt.Errorf("debe seleccionar al menos un componente")
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	placeholders := make([]string, len(componenteIDs))
	args := make([]interface{}, 0, len(componenteIDs)+1)

	args = append(args, equipoID)

	for i, id := range componenteIDs {
		if id <= 0 {
			_ = tx.Rollback()
			return fmt.Errorf("componente_id inválido")
		}

		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE componentes_equipo
		SET
			equipo_id = $1,
			actualizado_en = NOW()
		WHERE id IN (%s)
		  AND activo = TRUE
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