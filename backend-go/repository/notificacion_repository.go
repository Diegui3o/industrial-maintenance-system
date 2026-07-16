package repository

import (
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
