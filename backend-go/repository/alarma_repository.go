// repository/alarma_repository.go
package repository

import (
	"database/sql"
	"fmt"

	"backend/models"
)

type AlarmaRepository struct {
	DB *sql.DB
}

// Crear: inserta una nueva alarma
func (r *AlarmaRepository) Crear(a *models.Alarma) error {
	query := `
        INSERT INTO alarmas (equipo_id, tipo, mensaje, severidad, estado)
        VALUES ($1, $2, $3, $4, 'activa')
        RETURNING id, fecha_generada
    `
	return r.DB.QueryRow(query, a.EquipoID, a.Tipo, a.Mensaje, a.Severidad).Scan(&a.ID, &a.FechaGenerada)
}

// ListarActivas: alarmas no cerradas
func (r *AlarmaRepository) ListarActivas() ([]models.Alarma, error) {
	query := `
        SELECT id, equipo_id, tipo, mensaje, severidad, estado, fecha_generada, fecha_cierre
        FROM alarmas
        WHERE estado IN ('activa', 'atendida')
        ORDER BY 
            CASE severidad 
                WHEN 'critica' THEN 1 
                WHEN 'alta' THEN 2 
                WHEN 'media' THEN 3 
                WHEN 'baja' THEN 4 
            END,
            fecha_generada DESC
    `
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alarmas []models.Alarma
	for rows.Next() {
		var a models.Alarma
		if err := rows.Scan(&a.ID, &a.EquipoID, &a.Tipo, &a.Mensaje, &a.Severidad, &a.Estado, &a.FechaGenerada, &a.FechaCierre); err != nil {
			return nil, err
		}
		alarmas = append(alarmas, a)
	}
	return alarmas, rows.Err()
}

// ListarPorEquipo: historial de alarmas de un equipo
func (r *AlarmaRepository) ListarPorEquipo(equipoID int) ([]models.Alarma, error) {
	query := `
        SELECT id, equipo_id, tipo, mensaje, severidad, estado, fecha_generada, fecha_cierre
        FROM alarmas
        WHERE equipo_id = $1
        ORDER BY fecha_generada DESC
    `
	rows, err := r.DB.Query(query, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alarmas []models.Alarma
	for rows.Next() {
		var a models.Alarma
		if err := rows.Scan(&a.ID, &a.EquipoID, &a.Tipo, &a.Mensaje, &a.Severidad, &a.Estado, &a.FechaGenerada, &a.FechaCierre); err != nil {
			return nil, err
		}
		alarmas = append(alarmas, a)
	}
	return alarmas, rows.Err()
}

// Atender: marca alarma como atendida
func (r *AlarmaRepository) Atender(id int) error {
	result, err := r.DB.Exec(`UPDATE alarmas SET estado = 'atendida' WHERE id = $1 AND estado = 'activa'`, id)
	if err != nil {
		return err
	}
	filas, _ := result.RowsAffected()
	if filas == 0 {
		return fmt.Errorf("alarma no encontrada o ya fue atendida")
	}
	return nil
}

// Cerrar: cierra la alarma
func (r *AlarmaRepository) Cerrar(id int) error {
	result, err := r.DB.Exec(`UPDATE alarmas SET estado = 'cerrada', fecha_cierre = NOW() WHERE id = $1 AND estado IN ('activa', 'atendida')`, id)
	if err != nil {
		return err
	}
	filas, _ := result.RowsAffected()
	if filas == 0 {
		return fmt.Errorf("alarma no encontrada o ya cerrada")
	}
	return nil
}

// ContarActivas: total de alarmas activas (para dashboard)
func (r *AlarmaRepository) ContarActivas() (int, error) {
	var total int
	err := r.DB.QueryRow(`SELECT COUNT(*) FROM alarmas WHERE estado IN ('activa', 'atendida')`).Scan(&total)
	return total, err
}

func (r *AlarmaRepository) CerrarAlarmasActivasPorEquipo(equipoID int) (int, error) {
	result, err := r.DB.Exec(`
        UPDATE alarmas
        SET estado = 'cerrada', fecha_cierre = NOW()
        WHERE equipo_id = $1 AND estado IN ('activa', 'atendida')
    `, equipoID)
	if err != nil {
		return 0, err
	}
	cerradas, _ := result.RowsAffected()
	return int(cerradas), nil
}
