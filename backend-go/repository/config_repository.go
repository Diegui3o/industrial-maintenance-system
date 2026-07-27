package repository

import (
	"backend/models"
	"database/sql"
	"fmt"
)

type ConfigRepository struct {
	DB *sql.DB
}

func NewConfigRepository(db *sql.DB) *ConfigRepository {
	return &ConfigRepository{DB: db}
}

func (r *ConfigRepository) ObtenerUmbrales(equipoID int, parametro string) (*models.ConfigUmbral, error) {
	u := &models.ConfigUmbral{}
	err := r.DB.QueryRow(`
        SELECT id, equipo_id, parametro, umbral_min, umbral_max, unidad, severidad, activo
        FROM config_umbrales
        WHERE equipo_id = $1 AND parametro = $2 AND activo = true
    `, equipoID, parametro).Scan(&u.ID, &u.EquipoID, &u.Parametro, &u.UmbralMin, &u.UmbralMax, &u.Unidad, &u.Severidad, &u.Activo)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *ConfigRepository) ObtenerFuentesActivas(tipo string) ([]models.ConfigFuente, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, tipo_fuente, endpoint, intervalo_segundos, timeout_segundos, reintentos
        FROM config_fuentes
        WHERE tipo_fuente = $1 AND activo = true
    `, tipo)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fuentes []models.ConfigFuente
	for rows.Next() {
		var f models.ConfigFuente
		if err := rows.Scan(&f.ID, &f.EquipoID, &f.TipoFuente, &f.Endpoint, &f.IntervaloSegundos, &f.TimeoutSegundos, &f.Reintentos); err != nil {
			return nil, err
		}
		fuentes = append(fuentes, f)
	}
	return fuentes, rows.Err()
}

func (r *ConfigRepository) CrearUmbral(u *models.ConfigUmbral) error {
	return r.DB.QueryRow(`
        INSERT INTO config_umbrales (equipo_id, parametro, umbral_min, umbral_max, unidad, severidad)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `, u.EquipoID, u.Parametro, u.UmbralMin, u.UmbralMax, u.Unidad, u.Severidad).Scan(&u.ID)
}

func (r *ConfigRepository) CrearFuente(f *models.ConfigFuente) error {
	var existe int
	r.DB.QueryRow(`
        SELECT COUNT(*) FROM config_fuentes 
        WHERE equipo_id = $1 AND tipo_fuente = $2
    `, f.EquipoID, f.TipoFuente).Scan(&existe)

	if existe > 0 {
		return fmt.Errorf("el equipo %d ya tiene una fuente de tipo '%s'. Use PUT para actualizarla", f.EquipoID, f.TipoFuente)
	}

	return r.DB.QueryRow(`
        INSERT INTO config_fuentes (equipo_id, tipo_fuente, endpoint, intervalo_segundos, timeout_segundos, reintentos)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `, f.EquipoID, f.TipoFuente, f.Endpoint, f.IntervaloSegundos, f.TimeoutSegundos, f.Reintentos).Scan(&f.ID)
}

func (r *ConfigRepository) ListarUmbralesPorEquipo(equipoID int) ([]models.ConfigUmbral, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, parametro, umbral_min, umbral_max, unidad, severidad, activo
        FROM config_umbrales
        WHERE equipo_id = $1
        ORDER BY parametro
    `, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var umbrales []models.ConfigUmbral
	for rows.Next() {
		var u models.ConfigUmbral
		if err := rows.Scan(&u.ID, &u.EquipoID, &u.Parametro, &u.UmbralMin, &u.UmbralMax, &u.Unidad, &u.Severidad, &u.Activo); err != nil {
			return nil, err
		}
		umbrales = append(umbrales, u)
	}
	return umbrales, rows.Err()
}

func (r *ConfigRepository) ListarFuentes() ([]models.ConfigFuente, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, tipo_fuente, endpoint, intervalo_segundos, timeout_segundos, reintentos, activo
        FROM config_fuentes
        ORDER BY id ASC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fuentes []models.ConfigFuente
	for rows.Next() {
		var f models.ConfigFuente
		if err := rows.Scan(&f.ID, &f.EquipoID, &f.TipoFuente, &f.Endpoint, &f.IntervaloSegundos, &f.TimeoutSegundos, &f.Reintentos, &f.Activo); err != nil {
			return nil, err
		}
		fuentes = append(fuentes, f)
	}
	return fuentes, rows.Err()
}

func (r *ConfigRepository) ActualizarFuente(id int, f *models.ConfigFuente) error {
	result, err := r.DB.Exec(`
        UPDATE config_fuentes
        SET intervalo_segundos = $1, timeout_segundos = $2, reintentos = $3, activo = $4
        WHERE id = $5
    `, f.IntervaloSegundos, f.TimeoutSegundos, f.Reintentos, f.Activo, id)
	if err != nil {
		return err
	}
	filas, _ := result.RowsAffected()
	if filas == 0 {
		return fmt.Errorf("fuente no encontrada")
	}
	return nil
}

func (r *ConfigRepository) EliminarFuente(id int) error {
	result, err := r.DB.Exec(`DELETE FROM config_fuentes WHERE id = $1`, id)
	if err != nil {
		return err
	}
	filas, _ := result.RowsAffected()
	if filas == 0 {
		return fmt.Errorf("fuente no encontrada")
	}
	return nil
}

func (r *ConfigRepository) ObtenerFuentePorID(id int) (*models.ConfigFuente, error) {
	f := &models.ConfigFuente{}
	err := r.DB.QueryRow(`
        SELECT id, equipo_id, tipo_fuente, endpoint, intervalo_segundos, timeout_segundos, reintentos, activo
        FROM config_fuentes WHERE id = $1
    `, id).Scan(&f.ID, &f.EquipoID, &f.TipoFuente, &f.Endpoint, &f.IntervaloSegundos, &f.TimeoutSegundos, &f.Reintentos, &f.Activo)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("fuente no encontrada")
	}
	return f, err
}

func (r *ConfigRepository) ListarFuentesPorEquipo(equipoID int) ([]models.ConfigFuente, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, tipo_fuente, endpoint, intervalo_segundos, timeout_segundos, reintentos, activo
        FROM config_fuentes WHERE equipo_id = $1 ORDER BY id ASC
    `, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fuentes []models.ConfigFuente
	for rows.Next() {
		var f models.ConfigFuente
		if err := rows.Scan(&f.ID, &f.EquipoID, &f.TipoFuente, &f.Endpoint, &f.IntervaloSegundos, &f.TimeoutSegundos, &f.Reintentos, &f.Activo); err != nil {
			return nil, err
		}
		fuentes = append(fuentes, f)
	}
	return fuentes, rows.Err()
}

func (r *ConfigRepository) ObtenerEstadoEquipo(equipoID int) (string, error) {
	var estado string
	err := r.DB.QueryRow(`SELECT estado_equipo FROM equipos WHERE id = $1`, equipoID).Scan(&estado)
	return estado, err
}
