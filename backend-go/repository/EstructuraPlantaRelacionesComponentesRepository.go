package repository

import (
	"fmt"

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
	relaciones []models.RelacionComponente,
) error {
	if equipoID <= 0 {
		return fmt.Errorf("equipo_id inválido")
	}

	if len(relaciones) == 0 {
		return fmt.Errorf("debe existir al menos una relación")
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	defer tx.Rollback()

	for _, relacion := range relaciones {
		if relacion.ComponenteID <= 0 {
			return fmt.Errorf("relación de componente inválida")
		}

		_, err := tx.Exec(`
            UPDATE componentes_equipo
            SET
                equipo_id = $1,
                actualizado_en = NOW()
            WHERE id = $2
              AND activo = TRUE
        `,
			relacion.EquipoID,
			relacion.ComponenteID,
		)

		if err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}
