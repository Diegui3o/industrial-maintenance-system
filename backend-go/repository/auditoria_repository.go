// repository/auditoria_repository.go
package repository

import (
	"database/sql"
	"fmt"

	"backend/models"
)

type AuditoriaRepository struct {
	db *sql.DB
}

func NewAuditoriaRepository(db *sql.DB) *AuditoriaRepository {
	return &AuditoriaRepository{db: db}
}

// Registrar: guarda una acción de auditoría
func (r *AuditoriaRepository) Registrar(usuarioID *int, tabla, accion, detalle string) error {
	query := `
        INSERT INTO auditoria (usuario_id, tabla, accion, detalle)
        VALUES ($1, $2, $3, $4)
    `
	_, err := r.db.Exec(query, usuarioID, tabla, accion, detalle)
	if err != nil {
		return fmt.Errorf("error registrando auditoría: %w", err)
	}
	return nil
}

// ListarUltimas: devuelve las últimas 100 acciones
func (r *AuditoriaRepository) ListarUltimas() ([]models.Auditoria, error) {
	query := `
        SELECT 
            a.id, 
            a.usuario_id, 
            COALESCE(u.nombre, 'Sistema') AS nombre_usuario,
            a.tabla, 
            a.accion, 
            a.detalle, 
            a.fecha
        FROM auditoria a
        LEFT JOIN usuarios u ON u.id = a.usuario_id
        ORDER BY a.fecha DESC
        LIMIT 100
    `

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error consultando auditoría: %w", err)
	}
	defer rows.Close()

	var registros []models.Auditoria
	for rows.Next() {
		var reg models.Auditoria
		err := rows.Scan(
			&reg.ID,
			&reg.UsuarioID,
			&reg.NombreUsuario,
			&reg.Tabla,
			&reg.Accion,
			&reg.Detalle,
			&reg.Fecha,
		)
		if err != nil {
			return nil, fmt.Errorf("error escaneando auditoría: %w", err)
		}
		registros = append(registros, reg)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterando auditoría: %w", err)
	}

	return registros, nil
}

// ListarPorTabla: filtra acciones de una tabla específica
func (r *AuditoriaRepository) ListarPorTabla(tabla string) ([]models.Auditoria, error) {
	query := `
        SELECT 
            a.id, 
            a.usuario_id, 
            COALESCE(u.nombre, 'Sistema') AS nombre_usuario,
            a.tabla, 
            a.accion, 
            a.detalle, 
            a.fecha
        FROM auditoria a
        LEFT JOIN usuarios u ON u.id = a.usuario_id
        WHERE a.tabla = $1
        ORDER BY a.fecha DESC
        LIMIT 100
    `

	rows, err := r.db.Query(query, tabla)
	if err != nil {
		return nil, fmt.Errorf("error consultando auditoría por tabla: %w", err)
	}
	defer rows.Close()

	var registros []models.Auditoria
	for rows.Next() {
		var reg models.Auditoria
		err := rows.Scan(
			&reg.ID,
			&reg.UsuarioID,
			&reg.NombreUsuario,
			&reg.Tabla,
			&reg.Accion,
			&reg.Detalle,
			&reg.Fecha,
		)
		if err != nil {
			return nil, fmt.Errorf("error escaneando auditoría: %w", err)
		}
		registros = append(registros, reg)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterando auditoría: %w", err)
	}

	return registros, nil
}

// ListarPorUsuario: filtra acciones de un usuario específico
func (r *AuditoriaRepository) ListarPorUsuario(usuarioID int) ([]models.Auditoria, error) {
	query := `
        SELECT 
            a.id, 
            a.usuario_id, 
            COALESCE(u.nombre, 'Sistema') AS nombre_usuario,
            a.tabla, 
            a.accion, 
            a.detalle, 
            a.fecha
        FROM auditoria a
        LEFT JOIN usuarios u ON u.id = a.usuario_id
        WHERE a.usuario_id = $1
        ORDER BY a.fecha DESC
        LIMIT 100
    `

	rows, err := r.db.Query(query, usuarioID)
	if err != nil {
		return nil, fmt.Errorf("error consultando auditoría por usuario: %w", err)
	}
	defer rows.Close()

	var registros []models.Auditoria
	for rows.Next() {
		var reg models.Auditoria
		err := rows.Scan(
			&reg.ID,
			&reg.UsuarioID,
			&reg.NombreUsuario,
			&reg.Tabla,
			&reg.Accion,
			&reg.Detalle,
			&reg.Fecha,
		)
		if err != nil {
			return nil, fmt.Errorf("error escaneando auditoría: %w", err)
		}
		registros = append(registros, reg)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterando auditoría: %w", err)
	}

	return registros, nil
}
