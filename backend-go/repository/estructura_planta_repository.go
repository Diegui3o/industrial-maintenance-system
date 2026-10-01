package repository

import (
	"database/sql"

	"backend/models"
)

type EstructuraPlantaRepository struct {
	DB *sql.DB
}

func NewEstructuraPlantaRepository(db *sql.DB) *EstructuraPlantaRepository {
	return &EstructuraPlantaRepository{DB: db}
}

func (r *EstructuraPlantaRepository) ListarMasterGeneral() ([]models.MaestroGeneralItem, error) {
	rows, err := r.DB.Query(`
		SELECT
			e.fase,

			p.id,
			p.nombre,

			sp.id,
			sp.nombre,

			e.id,
			e.codigo,
			e.nombre,

			c.id,
			c.codigo,
			c.tag,
			c.nombre

		FROM procesos_planta p

		INNER JOIN subprocesos_planta sp
			ON sp.proceso_id = p.id
			AND sp.activo = TRUE

		INNER JOIN planta_equipos pe
			ON pe.subproceso_id = sp.id

		INNER JOIN equipos e
			ON e.id = pe.equipo_id

		LEFT JOIN componentes_equipo c
			ON c.equipo_id = e.id
			AND c.activo = TRUE

		WHERE p.activo = TRUE

		ORDER BY
			p.nombre,
			sp.nombre,
			e.codigo,
			c.nombre
	`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	resultado := make([]models.MaestroGeneralItem, 0)

	for rows.Next() {
		var item models.MaestroGeneralItem

		err := rows.Scan(
			&item.Fase,

			&item.ProcesoID,
			&item.Proceso,

			&item.SubprocesoID,
			&item.Subproceso,

			&item.EquipoID,
			&item.EquipoCodigo,
			&item.EquipoNombre,

			&item.ComponenteID,
			&item.ComponenteCodigo,
			&item.ComponenteTag,
			&item.ComponenteNombre,
		)

		if err != nil {
			return nil, err
		}

		// Repuestos todavía no están relacionados en la estructura
		// del Maestro General.
		item.RepuestoID = nil
		item.RepuestoNombre = nil

		resultado = append(resultado, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resultado, nil
}