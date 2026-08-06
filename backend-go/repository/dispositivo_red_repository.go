// repository/dispositivo_red_repository.go
package repository

import (
	"backend/models"
	"database/sql"
	"fmt"
)

type DispositivoRedRepository struct {
	DB *sql.DB // ← MAYÚSCULA para coincidir con r.DB
}

func NewDispositivoRedRepository(db *sql.DB) *DispositivoRedRepository {
	return &DispositivoRedRepository{DB: db}
}

func (r *DispositivoRedRepository) Crear(d *models.DispositivoRed) (int, error) {
	query := `
        INSERT INTO dispositivos_red (equipo_id, tipo_dispositivo, ip, puerto, protocolo, usuario, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `
	err := r.DB.QueryRow(query, d.EquipoID, d.TipoDispositivo, d.IP, d.Puerto, d.Protocolo, d.Usuario, d.PasswordHash).Scan(&d.ID)
	return d.ID, err
}

func (r *DispositivoRedRepository) ListarTodos() ([]models.DispositivoRed, error) {
	query := `
        SELECT id, equipo_id, tipo_dispositivo, ip, puerto, protocolo, usuario
        FROM dispositivos_red
        ORDER BY id ASC
    `
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dispositivos []models.DispositivoRed
	for rows.Next() {
		var d models.DispositivoRed
		if err := rows.Scan(&d.ID, &d.EquipoID, &d.TipoDispositivo, &d.IP, &d.Puerto, &d.Protocolo, &d.Usuario); err != nil {
			return nil, err
		}
		dispositivos = append(dispositivos, d)
	}
	return dispositivos, rows.Err()
}

func (r *DispositivoRedRepository) ListarPorEquipo(equipoID int) ([]models.DispositivoRed, error) {
	query := `
        SELECT id, equipo_id, tipo_dispositivo, ip, puerto, protocolo, usuario
        FROM dispositivos_red
        WHERE equipo_id = $1
        ORDER BY id ASC
    `
	rows, err := r.DB.Query(query, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dispositivos []models.DispositivoRed
	for rows.Next() {
		var d models.DispositivoRed
		if err := rows.Scan(&d.ID, &d.EquipoID, &d.TipoDispositivo, &d.IP, &d.Puerto, &d.Protocolo, &d.Usuario); err != nil {
			return nil, err
		}
		dispositivos = append(dispositivos, d)
	}
	return dispositivos, rows.Err()
}

func (r *DispositivoRedRepository) ObtenerPorID(id int) (*models.DispositivoRed, error) {
	d := &models.DispositivoRed{}
	query := `
        SELECT id, equipo_id, tipo_dispositivo, ip, puerto, protocolo, usuario
        FROM dispositivos_red
        WHERE id = $1
    `
	err := r.DB.QueryRow(query, id).Scan(&d.ID, &d.EquipoID, &d.TipoDispositivo, &d.IP, &d.Puerto, &d.Protocolo, &d.Usuario)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("dispositivo no encontrado")
	}
	return d, err
}

func (r *DispositivoRedRepository) Actualizar(id int, d *models.DispositivoRed) error {
	if d.PasswordHash != "" {
		query := `
            UPDATE dispositivos_red
            SET tipo_dispositivo = $1, ip = $2, puerto = $3, protocolo = $4, usuario = $5, password_hash = $6
            WHERE id = $7
        `
		_, err := r.DB.Exec(query, d.TipoDispositivo, d.IP, d.Puerto, d.Protocolo, d.Usuario, d.PasswordHash, id)
		if err != nil {
			return err
		}
	} else {
		query := `
            UPDATE dispositivos_red
            SET tipo_dispositivo = $1, ip = $2, puerto = $3, protocolo = $4, usuario = $5
            WHERE id = $6
        `
		_, err := r.DB.Exec(query, d.TipoDispositivo, d.IP, d.Puerto, d.Protocolo, d.Usuario, id)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *DispositivoRedRepository) Eliminar(id int) error {
	result, err := r.DB.Exec(`DELETE FROM dispositivos_red WHERE id = $1`, id)
	if err != nil {
		return err
	}
	filas, _ := result.RowsAffected()
	if filas == 0 {
		return fmt.Errorf("dispositivo no encontrado")
	}
	return nil
}
