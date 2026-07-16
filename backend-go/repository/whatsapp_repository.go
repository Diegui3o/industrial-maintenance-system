package repository

import (
	"backend/models"
	"database/sql"
)

type WhatsAppRepository struct {
	DB *sql.DB
}

func NewWhatsAppRepository(db *sql.DB) *WhatsAppRepository {
	return &WhatsAppRepository{DB: db}
}

func (r *WhatsAppRepository) ObtenerGruposPorEquipo(equipoID int) ([]models.GrupoWhatsApp, error) {
	rows, err := r.DB.Query(`
        SELECT g.id, g.nombre, g.jid, g.activo
        FROM grupos_whatsapp g
        JOIN equipo_grupo eg ON eg.grupo_id = g.id
        WHERE eg.equipo_id = $1 AND g.activo = true
    `, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grupos []models.GrupoWhatsApp
	for rows.Next() {
		var g models.GrupoWhatsApp
		if err := rows.Scan(&g.ID, &g.Nombre, &g.JID, &g.Activo); err != nil {
			return nil, err
		}
		grupos = append(grupos, g)
	}
	return grupos, rows.Err()
}

func (r *WhatsAppRepository) CrearGrupo(g *models.GrupoWhatsApp) error {
	return r.DB.QueryRow(`
        INSERT INTO grupos_whatsapp (nombre, jid) VALUES ($1, $2) RETURNING id
    `, g.Nombre, g.JID).Scan(&g.ID)
}

func (r *WhatsAppRepository) ListarGrupos() ([]models.GrupoWhatsApp, error) {
	rows, err := r.DB.Query(`SELECT id, nombre, jid, activo FROM grupos_whatsapp ORDER BY nombre`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grupos []models.GrupoWhatsApp
	for rows.Next() {
		var g models.GrupoWhatsApp
		if err := rows.Scan(&g.ID, &g.Nombre, &g.JID, &g.Activo); err != nil {
			return nil, err
		}
		grupos = append(grupos, g)
	}
	return grupos, rows.Err()
}

func (r *WhatsAppRepository) AsociarEquipoGrupo(equipoID, grupoID int) error {
	_, err := r.DB.Exec(`
        INSERT INTO equipo_grupo (equipo_id, grupo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
    `, equipoID, grupoID)
	return err
}
