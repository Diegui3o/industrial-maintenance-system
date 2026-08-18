package repository

import (
	"backend/models"
	"database/sql"
	"log"
)

type WhatsAppRepository struct {
	DB *sql.DB
}

func (r *WhatsAppRepository) ObtenerGrupoPorID(id int) (*models.GrupoWhatsApp, error) {
	var g models.GrupoWhatsApp
	err := r.DB.QueryRow(`
		SELECT id, nombre, jid, activo FROM grupos_whatsapp WHERE id = $1
	`, id).Scan(&g.ID, &g.Nombre, &g.JID, &g.Activo)
	if err != nil {
		return nil, err
	}
	return &g, nil
}

type WhatsAppInstancia struct {
	ID         int
	Nombre     string
	Telefono   string
	Estado     string
	RutaSesion string
}

func NewWhatsAppRepository(db *sql.DB) *WhatsAppRepository {
	return &WhatsAppRepository{DB: db}
}

func (r *WhatsAppRepository) ObtenerGruposPorEquipo(equipoID int) ([]models.GrupoWhatsApp, error) {
	log.Printf("🔍 Buscando grupos para equipo %d", equipoID)

	rows, err := r.DB.Query(`
        SELECT g.id, g.nombre, g.jid, g.activo
        FROM grupos_whatsapp g
        JOIN equipo_grupo eg ON eg.grupo_id = g.id
        WHERE eg.equipo_id = $1 AND g.activo = true
    `, equipoID)
	if err != nil {
		log.Printf("❌ Error SQL: %v", err)
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
	log.Printf("📊 Filas obtenidas: %d", len(grupos))
	return grupos, rows.Err()
}

func (r *WhatsAppRepository) CrearGrupo(g *models.GrupoWhatsApp) error {
	return r.DB.QueryRow(`
        INSERT INTO grupos_whatsapp (nombre, jid, usuario_id) VALUES ($1, $2, $3) RETURNING id
    `, g.Nombre, g.JID, g.UsuarioID).Scan(&g.ID)
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

func (r *WhatsAppRepository) ObtenerInstancia(id int) (*WhatsAppInstancia, error) {

	var instancia WhatsAppInstancia

	err := r.DB.QueryRow(`
		SELECT
			id,
			nombre,
			telefono,
			estado,
			ruta_sesion
		FROM whatsapp_instancias
		WHERE id = $1
	`,
		id,
	).Scan(
		&instancia.ID,
		&instancia.Nombre,
		&instancia.Telefono,
		&instancia.Estado,
		&instancia.RutaSesion,
	)

	if err != nil {
		return nil, err
	}

	return &instancia, nil
}

// DesasociarEquipoGrupo: quita un equipo de un grupo
func (r *WhatsAppRepository) DesasociarEquipoGrupo(equipoID, grupoID int) error {
	_, err := r.DB.Exec(`
		DELETE FROM equipo_grupo WHERE equipo_id = $1 AND grupo_id = $2
	`, equipoID, grupoID)
	return err
}

// ObtenerEquiposPorGrupo: lista los equipos asociados a un grupo
func (r *WhatsAppRepository) ObtenerEquiposPorGrupo(grupoID int) ([]models.Equipo, error) {
	rows, err := r.DB.Query(`
		SELECT e.id, e.codigo, e.nombre, e.area, e.critico, e.estado_equipo
		FROM equipos e
		JOIN equipo_grupo eg ON eg.equipo_id = e.id
		WHERE eg.grupo_id = $1
		ORDER BY e.nombre
	`, grupoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipos []models.Equipo
	for rows.Next() {
		var e models.Equipo
		if err := rows.Scan(&e.ID, &e.Codigo, &e.Nombre, &e.Area, &e.Critico, &e.EstadoEquipo); err != nil {
			return nil, err
		}
		equipos = append(equipos, e)
	}
	return equipos, rows.Err()
}

// EliminarGrupo: borra un grupo y sus asociaciones
func (r *WhatsAppRepository) EliminarGrupo(id int) error {
	_, err := r.DB.Exec(`DELETE FROM equipo_grupo WHERE grupo_id = $1`, id)
	if err != nil {
		return err
	}
	_, err = r.DB.Exec(`DELETE FROM grupos_whatsapp WHERE id = $1`, id)
	return err
}

// ActualizarGrupo: modifica nombre o JID
func (r *WhatsAppRepository) ActualizarGrupo(id int, nombre, jid string) error {
	_, err := r.DB.Exec(`
		UPDATE grupos_whatsapp SET nombre = $1, jid = $2 WHERE id = $3
	`, nombre, jid, id)
	return err
}

func (r *WhatsAppRepository) ListarGruposPorUsuario(usuarioID int) ([]models.GrupoWhatsApp, error) {
	query := `SELECT id, nombre, jid, activo, COALESCE(usuario_id,0) FROM grupos_whatsapp `
	args := []interface{}{}

	if usuarioID > 0 {
		query += `WHERE usuario_id = $1 `
		args = append(args, usuarioID)
	}
	query += `ORDER BY nombre`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var grupos []models.GrupoWhatsApp
	for rows.Next() {
		var g models.GrupoWhatsApp
		if err := rows.Scan(&g.ID, &g.Nombre, &g.JID, &g.Activo, &g.UsuarioID); err != nil {
			return nil, err
		}
		grupos = append(grupos, g)
	}
	return grupos, rows.Err()
}

func (r *WhatsAppRepository) CrearGrupoConUsuario(g *models.GrupoWhatsApp) error {
	return r.DB.QueryRow(`
		INSERT INTO grupos_whatsapp (nombre, jid, usuario_id) 
		VALUES ($1, $2, $3) RETURNING id
	`, g.Nombre, g.JID, g.UsuarioID).Scan(&g.ID)
}

func (r *WhatsAppRepository) ObtenerGrupoPorJID(jid string) (*models.GrupoWhatsApp, error) {
	var g models.GrupoWhatsApp
	err := r.DB.QueryRow(`SELECT id, nombre, jid, activo, usuario_id FROM grupos_whatsapp WHERE jid = $1`, jid).
		Scan(&g.ID, &g.Nombre, &g.JID, &g.Activo, &g.UsuarioID)
	if err != nil {
		return nil, err
	}
	return &g, nil
}
