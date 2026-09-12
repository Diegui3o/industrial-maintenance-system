package repository

import (
	"fmt"
	"strings"

	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarSubcomponentesParaRelacion(
	componenteID int,
) ([]models.SubcomponenteEquipo, error) {
	if componenteID <= 0 {
		return nil, fmt.Errorf("componente_id inválido")
	}

	rows, err := r.DB.Query(`
		SELECT
			id,
			componente_id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM subcomponentes_equipo
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resultado := make([]models.SubcomponenteEquipo, 0)

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

func (r *EstructuraPlantaRepository) RelacionarSubcomponentes(
	componenteID int,
	subcomponenteIDs []int,
) error {
	if componenteID <= 0 {
		return fmt.Errorf("componente_id inválido")
	}

	if len(subcomponenteIDs) == 0 {
		return fmt.Errorf("debe seleccionar al menos un subcomponente")
	}

	valores := make([]string, 0, len(subcomponenteIDs))
	args := make([]interface{}, 0, len(subcomponenteIDs)+1)

	args = append(args, componenteID)

	for i, id := range subcomponenteIDs {
		if id <= 0 {
			continue
		}

		param := fmt.Sprintf("$%d", i+2)
		valores = append(valores, param)
		args = append(args, id)
	}

	if len(valores) == 0 {
		return fmt.Errorf("no hay subcomponentes válidos")
	}

	query := fmt.Sprintf(`
		UPDATE subcomponentes_equipo
		SET componente_id = $1,
			actualizado_en = NOW()
		WHERE id IN (%s)
		  AND activo = TRUE
	`, strings.Join(valores, ","))

	_, err := r.DB.Exec(query, args...)
	return err
}