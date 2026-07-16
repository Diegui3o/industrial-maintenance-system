package repository

import (
	"backend/models"
	"database/sql"
	"time"
)

type NotificacionRepository struct {
	DB *sql.DB
}

func NewNotificacionRepository(db *sql.DB) *NotificacionRepository {
	return &NotificacionRepository{DB: db}
}

func (r *NotificacionRepository) Crear(tipo, destinatario, mensaje, estado string) error {
	_, err := r.DB.Exec(`
        INSERT INTO cola_notificaciones (tipo, destinatario, mensaje, estado)
        VALUES ($1, $2, $3, $4)
    `, tipo, destinatario, mensaje, estado)
	return err
}

func (r *NotificacionRepository) ObtenerPendientes(tipo string) ([]struct {
	ID           int
	Destinatario string
	Mensaje      string
}, error) {
	rows, err := r.DB.Query(`
        SELECT id, destinatario, mensaje
        FROM cola_notificaciones
        WHERE tipo = $1 AND estado = 'pendiente' AND intentos < 3
        ORDER BY creado_en
        LIMIT 10
    `, tipo)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pendientes []struct {
		ID           int
		Destinatario string
		Mensaje      string
	}
	for rows.Next() {
		var p struct {
			ID           int
			Destinatario string
			Mensaje      string
		}
		rows.Scan(&p.ID, &p.Destinatario, &p.Mensaje)
		pendientes = append(pendientes, p)
	}
	return pendientes, rows.Err()
}

func (r *NotificacionRepository) MarcarEnviada(id int) error {
	_, err := r.DB.Exec(`
        UPDATE cola_notificaciones
        SET estado = 'enviado', enviado_en = $1
        WHERE id = $2
    `, time.Now(), id)
	return err
}

func (r *NotificacionRepository) ListarPlantillas() ([]models.PlantillaNotificacion, error) {
	rows, err := r.DB.Query(`SELECT id, nombre, canal, asunto, cuerpo, activo FROM plantillas_notificacion ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plantillas []models.PlantillaNotificacion
	for rows.Next() {
		var p models.PlantillaNotificacion
		rows.Scan(&p.ID, &p.Nombre, &p.Canal, &p.Asunto, &p.Cuerpo, &p.Activo)
		plantillas = append(plantillas, p)
	}
	return plantillas, rows.Err()
}

func (r *NotificacionRepository) ListarGrupos() ([]models.GrupoNotificacion, error) {
	rows, err := r.DB.Query(`SELECT id, nombre, descripcion, activo FROM grupos_notificacion ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grupos []models.GrupoNotificacion
	for rows.Next() {
		var g models.GrupoNotificacion
		rows.Scan(&g.ID, &g.Nombre, &g.Descripcion, &g.Activo)
		grupos = append(grupos, g)
	}
	return grupos, rows.Err()
}

func (r *NotificacionRepository) ListarDestinatariosPorGrupo(grupoID int) ([]models.Destinatario, error) {
	rows, err := r.DB.Query(`SELECT id, grupo_id, nombre, canal, destino, activo FROM destinatarios WHERE grupo_id = $1 AND activo = true`, grupoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dests []models.Destinatario
	for rows.Next() {
		var d models.Destinatario
		rows.Scan(&d.ID, &d.GrupoID, &d.Nombre, &d.Canal, &d.Destino, &d.Activo)
		dests = append(dests, d)
	}
	return dests, rows.Err()
}

func (r *NotificacionRepository) BuscarReglas(equipoID int, area, severidad, tipoEvento string) ([]models.ReglaNotificacion, error) {
	query := `
        SELECT DISTINCT r.id, r.equipo_id, r.area, r.severidad, r.tipo_evento, r.grupo_id, r.plantilla_id
        FROM reglas_notificacion r
        WHERE r.activo = true
        AND r.severidad = $1
        AND r.tipo_evento = $2
        AND (r.equipo_id IS NULL OR r.equipo_id = $3)
        AND (r.area IS NULL OR r.area = $4)
    `
	rows, err := r.DB.Query(query, severidad, tipoEvento, equipoID, area)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reglas []models.ReglaNotificacion
	for rows.Next() {
		var r models.ReglaNotificacion
		rows.Scan(&r.ID, &r.EquipoID, &r.Area, &r.Severidad, &r.TipoEvento, &r.GrupoID, &r.PlantillaID)
		reglas = append(reglas, r)
	}
	return reglas, rows.Err()
}

func (r *NotificacionRepository) RegistrarEnvio(reglaID, destID int, canal, destino, mensaje, estado, errorMsg string) error {
	_, err := r.DB.Exec(`
        INSERT INTO cola_notificaciones (regla_id, destinatario_id, canal, destino, mensaje, estado, error)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, reglaID, destID, canal, destino, mensaje, estado, errorMsg)
	return err
}

func (r *NotificacionRepository) ObtenerPlantilla(id int) (*models.PlantillaNotificacion, error) {
	p := &models.PlantillaNotificacion{}
	err := r.DB.QueryRow(`SELECT id, nombre, canal, asunto, cuerpo FROM plantillas_notificacion WHERE id = $1`, id).Scan(&p.ID, &p.Nombre, &p.Canal, &p.Asunto, &p.Cuerpo)
	return p, err
}
