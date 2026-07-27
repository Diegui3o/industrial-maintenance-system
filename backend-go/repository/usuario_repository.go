// repository/usuario_repository.go
package repository

import (
	"backend/models"
	"database/sql"
	"fmt"
)

type UsuarioRepository struct {
	DB *sql.DB
}

func (r *UsuarioRepository) Crear(u *models.Usuario) error {
	return r.DB.QueryRow(
		`INSERT INTO usuarios (nombre, username, area) VALUES ($1, $2, $3) RETURNING id, creado_en`,
		u.Nombre, u.Username, u.Area,
	).Scan(&u.ID, &u.CreadoEn)
}

func (r *UsuarioRepository) Listar() ([]models.Usuario, error) {
	rows, err := r.DB.Query(`SELECT id, nombre, username, area, creado_en FROM usuarios ORDER BY nombre`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usuarios []models.Usuario
	for rows.Next() {
		var u models.Usuario
		if err := rows.Scan(&u.ID, &u.Nombre, &u.Username, &u.Area, &u.CreadoEn); err != nil {
			return nil, err
		}
		usuarios = append(usuarios, u)
	}
	return usuarios, rows.Err()
}

func (r *UsuarioRepository) ObtenerPorID(id int) (*models.Usuario, error) {
	u := &models.Usuario{}
	err := r.DB.QueryRow(
		`SELECT id, nombre, username, area, creado_en FROM usuarios WHERE id = $1`, id,
	).Scan(&u.ID, &u.Nombre, &u.Username, &u.Area, &u.CreadoEn)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("usuario no encontrado")
	}
	return u, err
}
