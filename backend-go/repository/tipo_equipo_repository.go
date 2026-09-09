package repository

import (
	"database/sql"

	"backend/models"
)

type TipoEquipoRepository struct {
	DB *sql.DB
}

func NewTipoEquipoRepository(db *sql.DB) *TipoEquipoRepository {
	return &TipoEquipoRepository{
		DB: db,
	}
}

func (r *TipoEquipoRepository) Listar() ([]models.TipoEquipo, error) {
	rows, err := r.DB.Query(`
		SELECT
			id,
			codigo,
			nombre,
			descripcion,
			activo
		FROM tipos_equipo
		WHERE activo = TRUE
		ORDER BY nombre
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.TipoEquipo

	for rows.Next() {
		var item models.TipoEquipo

		if err := rows.Scan(
			&item.ID,
			&item.Codigo,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	return resultado, rows.Err()
}

func (r *TipoEquipoRepository) Crear(
	tipo models.TipoEquipo,
) (models.TipoEquipo, error) {

	err := r.DB.QueryRow(`
		INSERT INTO tipos_equipo (
			codigo,
			nombre,
			descripcion,
			activo
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`,
		tipo.Codigo,
		tipo.Nombre,
		tipo.Descripcion,
		tipo.Activo,
	).Scan(&tipo.ID)

	return tipo, err
}

func (r *TipoEquipoRepository) Asignar(
	equipoID int,
	tipoEquipoID int,
) error {

	_, err := r.DB.Exec(`
		INSERT INTO equipo_tipo (
			equipo_id,
			tipo_equipo_id
		)
		VALUES ($1, $2)
		ON CONFLICT (equipo_id, tipo_equipo_id)
		DO NOTHING
	`,
		equipoID,
		tipoEquipoID,
	)

	return err
}

func (r *TipoEquipoRepository) ListarPorEquipo(
	equipoID int,
) ([]models.TipoEquipo, error) {

	rows, err := r.DB.Query(`
		SELECT
			t.id,
			t.codigo,
			t.nombre,
			t.descripcion,
			t.activo
		FROM tipos_equipo t
		INNER JOIN equipo_tipo et
			ON et.tipo_equipo_id = t.id
		WHERE et.equipo_id = $1
		ORDER BY t.nombre
	`, equipoID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultado []models.TipoEquipo

	for rows.Next() {
		var item models.TipoEquipo

		if err := rows.Scan(
			&item.ID,
			&item.Codigo,
			&item.Nombre,
			&item.Descripcion,
			&item.Activo,
		); err != nil {
			return nil, err
		}

		resultado = append(resultado, item)
	}

	return resultado, rows.Err()
}