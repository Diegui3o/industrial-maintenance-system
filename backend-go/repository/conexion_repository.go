package repository

import (
	"database/sql"
	"backend/models"
)

type ConexionRepository struct {
	DB *sql.DB
}

func NewConexionRepository(db *sql.DB) *ConexionRepository {
	return &ConexionRepository{DB: db}
}

func (r *ConexionRepository) ListarPorEquipo(equipoID int) ([]models.Conexion, error) {
	query := `
		SELECT id, origen_id, destino_id, tipo_conexion, protocolo,
		       medio_fisico, puerto_origen, puerto_destino, etiqueta_cable,
		       activo, notas
		FROM conexiones
		WHERE origen_id = $1 OR destino_id = $1
		ORDER BY id
	`
	rows, err := r.DB.Query(query, equipoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conexiones []models.Conexion
	for rows.Next() {
		var c models.Conexion
		rows.Scan(&c.ID, &c.OrigenID, &c.DestinoID, &c.TipoConexion,
			&c.Protocolo, &c.MedioFisico, &c.PuertoOrigen, &c.PuertoDestino,
			&c.EtiquetaCable, &c.Activo, &c.Notas)
		conexiones = append(conexiones, c)
	}
	return conexiones, rows.Err()
}

func (r *ConexionRepository) Crear(c *models.Conexion) error {
	return r.DB.QueryRow(`
		INSERT INTO conexiones (origen_id, destino_id, tipo_conexion, protocolo,
			medio_fisico, puerto_origen, puerto_destino, etiqueta_cable, notas)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, creado_en
	`, c.OrigenID, c.DestinoID, c.TipoConexion, c.Protocolo,
		c.MedioFisico, c.PuertoOrigen, c.PuertoDestino, c.EtiquetaCable, c.Notas).Scan(&c.ID, &c.CreadoEn)
}

func (r *ConexionRepository) Eliminar(id int) error {
	_, err := r.DB.Exec(`DELETE FROM conexiones WHERE id = $1`, id)
	return err
}