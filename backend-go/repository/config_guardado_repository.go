// repository/config_guardado_repository.go
package repository

import (
	"backend/models"
	"database/sql"
)

type ConfigGuardadoRepository struct {
	DB *sql.DB
}

func NewConfigGuardadoRepository(db *sql.DB) *ConfigGuardadoRepository {
	return &ConfigGuardadoRepository{DB: db}
}

func (r *ConfigGuardadoRepository) ObtenerPrioridadPorID(id int) (*models.ConfigPrioridad, error) {
	var p models.ConfigPrioridad
	err := r.DB.QueryRow(`
		SELECT id, nombre, descripcion, guardar_siempre, muestreo_intervalo_minutos, 
		       cambio_minimo_porcentaje, guardar_si_calidad_mala, creado_en, actualizado_en
		FROM config_prioridades WHERE id = $1
	`, id).Scan(&p.ID, &p.Nombre, &p.Descripcion, &p.GuardarSiempre, &p.MuestreoIntervaloMinutos,
		&p.CambioMinimoPorcentaje, &p.GuardarSiCalidadMala, &p.CreadoEn, &p.ActualizadoEn)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (r *ConfigGuardadoRepository) ObtenerPrioridadPorEquipo(equipoID int) (*models.ConfigPrioridad, error) {
	var p models.ConfigPrioridad
	err := r.DB.QueryRow(`
		SELECT cp.id, cp.nombre, cp.descripcion, cp.guardar_siempre, cp.muestreo_intervalo_minutos, 
		       cp.cambio_minimo_porcentaje, cp.guardar_si_calidad_mala, cp.creado_en, cp.actualizado_en
		FROM config_prioridad_equipos cpe
		JOIN config_prioridades cp ON cpe.prioridad_id = cp.id
		WHERE cpe.equipo_id = $1 AND cpe.activo = TRUE
	`, equipoID).Scan(&p.ID, &p.Nombre, &p.Descripcion, &p.GuardarSiempre, &p.MuestreoIntervaloMinutos,
		&p.CambioMinimoPorcentaje, &p.GuardarSiCalidadMala, &p.CreadoEn, &p.ActualizadoEn)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (r *ConfigGuardadoRepository) ObtenerPrioridadPorParametro(parametro string) (*models.ConfigPrioridad, error) {
	var p models.ConfigPrioridad
	err := r.DB.QueryRow(`
		SELECT cp.id, cp.nombre, cp.descripcion, cp.guardar_siempre, cp.muestreo_intervalo_minutos, 
		       cp.cambio_minimo_porcentaje, cp.guardar_si_calidad_mala, cp.creado_en, cp.actualizado_en
		FROM config_prioridad_parametros cpp
		JOIN config_prioridades cp ON cpp.prioridad_id = cp.id
		WHERE cpp.parametro = $1 AND cpp.activo = TRUE
	`, parametro).Scan(&p.ID, &p.Nombre, &p.Descripcion, &p.GuardarSiempre, &p.MuestreoIntervaloMinutos,
		&p.CambioMinimoPorcentaje, &p.GuardarSiCalidadMala, &p.CreadoEn, &p.ActualizadoEn)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &p, err
}

func (r *ConfigGuardadoRepository) ObtenerPrioridadPorDefecto() (*models.ConfigPrioridad, error) {
	var p models.ConfigPrioridad
	err := r.DB.QueryRow(`
		SELECT id, nombre, descripcion, guardar_siempre, muestreo_intervalo_minutos, 
		       cambio_minimo_porcentaje, guardar_si_calidad_mala, creado_en, actualizado_en
		FROM config_prioridades WHERE nombre = 'normal'
	`).Scan(&p.ID, &p.Nombre, &p.Descripcion, &p.GuardarSiempre, &p.MuestreoIntervaloMinutos,
		&p.CambioMinimoPorcentaje, &p.GuardarSiCalidadMala, &p.CreadoEn, &p.ActualizadoEn)
	return &p, err
}

func (r *ConfigGuardadoRepository) ObtenerEventosEspeciales() ([]models.ConfigEventoEspecial, error) {
	rows, err := r.DB.Query(`
		SELECT id, nombre, descripcion, prioridad_id, guardar_antes, guardar_durante, 
		       guardar_despues, ventana_segundos_antes, ventana_segundos_despues, activo,
		       creado_en, actualizado_en
		FROM config_eventos_especiales WHERE activo = TRUE
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var eventos []models.ConfigEventoEspecial
	for rows.Next() {
		var e models.ConfigEventoEspecial
		if err := rows.Scan(&e.ID, &e.Nombre, &e.Descripcion, &e.PrioridadID, &e.GuardarAntes,
			&e.GuardarDurante, &e.GuardarDespues, &e.VentanaSegundosAntes, &e.VentanaSegundosDespues,
			&e.Activo, &e.CreadoEn, &e.ActualizadoEn); err != nil {
			return nil, err
		}
		eventos = append(eventos, e)
	}
	return eventos, rows.Err()
}

func (r *ConfigGuardadoRepository) GuardarEvento(evento *models.DatoEvento) error {
	return r.DB.QueryRow(`
		INSERT INTO datos_eventos (
			equipo_id, tipo_evento, descripcion, estado_anterior, estado_nuevo,
			valor_anterior, valor_nuevo, parametro, timestamp_evento
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`, evento.EquipoID, evento.TipoEvento, evento.Descripcion, evento.EstadoAnterior,
		evento.EstadoNuevo, evento.ValorAnterior, evento.ValorNuevo, evento.Parametro,
		evento.TimestampEvento).Scan(&evento.ID)
}

func (r *ConfigGuardadoRepository) TieneEventoActivo(equipoID int, tipoEvento string) (bool, error) {
	var count int
	err := r.DB.QueryRow(`
		SELECT COUNT(*) FROM datos_eventos 
		WHERE equipo_id = $1 AND tipo_evento = $2 
		AND timestamp_evento > NOW() - INTERVAL '1 hour'
	`, equipoID, tipoEvento).Scan(&count)
	return count > 0, err
}
