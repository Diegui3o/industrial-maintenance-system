package repository

import (
	"fmt"
	"strings"

	"backend/models"
)

func (r *EstructuraPlantaRepository) ListarTodosSubprocesosSistemaPlanta() ([]models.SubprocesoSistemaPlanta, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			sistema_id,
			nombre,
			descripcion,
			activo
		FROM subprocesos_sistema_planta
		WHERE activo = TRUE
		ORDER BY nombre
	`)
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

func (r *EstructuraPlantaRepository) RelacionarSubprocesosConSistema(
	sistemaID int,
	subprocesoIDs []int,
) error {
	if sistemaID <= 0 {
		return fmt.Errorf("sistema_id inválido")
	}

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	// Primero quitamos todos los subprocesos
	// que actualmente pertenecen a este sistema.
	_, err = tx.Exec(`
		UPDATE subprocesos_sistema_planta
		SET
			sistema_id = NULL,
			actualizado_en = NOW()
		WHERE sistema_id = $1
	`, sistemaID)

	if err != nil {
		_ = tx.Rollback()
		return err
	}

	// Si no quedan seleccionados, simplemente
	// dejamos todos los subprocesos desvinculados.
	if len(subprocesoIDs) == 0 {
		return tx.Commit()
	}

	placeholders := make([]string, len(subprocesoIDs))
	args := make([]interface{}, 0, len(subprocesoIDs)+1)

	args = append(args, sistemaID)

	for i, id := range subprocesoIDs {
		if id <= 0 {
			_ = tx.Rollback()
			return fmt.Errorf("subproceso_sistema_id inválido")
		}

		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		UPDATE subprocesos_sistema_planta
		SET
			sistema_id = $1,
			actualizado_en = NOW()
		WHERE id IN (%s)
		  AND activo = TRUE
	`, strings.Join(placeholders, ", "))

	if _, err = tx.Exec(query, args...); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}