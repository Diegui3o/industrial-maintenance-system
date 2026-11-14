package repository

import (
	"database/sql"
	"time"

	"backend/models"
)

type ParadaRepository struct {
	DB *sql.DB
}

func NewParadaRepository(db *sql.DB) *ParadaRepository {
	return &ParadaRepository{DB: db}
}

// Crear inserta una nueva parada y devuelve su ID.
func (r *ParadaRepository) Crear(p *models.Parada) error {
	return r.DB.QueryRow(`
        INSERT INTO paradas_reportadas (
            equipo_id, tag_id, componente_id, repuesto_id,
            proceso_nombre, subproceso_nombre, componente_nombre,
            repuesto_nombre, tag_nombre,
            inicio, fin, duracion_minutos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, created_at
    `,
		p.EquipoID,
		p.TagID,
		p.ComponenteID,
		p.RepuestoID,
		nullableString(p.ProcesoNombre),
		nullableString(p.SubprocesoNombre),
		nullableString(p.ComponenteNombre),
		nullableString(p.RepuestoNombre),
		nullableString(p.TagNombre),
		p.Inicio,
		p.Fin,
		p.DuracionMinutos,
	).Scan(&p.ID, &p.CreatedAt)
}

// Listar devuelve las paradas en un rango de fechas.
// equipoID opcional (nil = todas).
func (r *ParadaRepository) Listar(
	desde, hasta time.Time,
	equipoID *int,
) ([]models.Parada, error) {
	query := `
        SELECT p.id, p.equipo_id, COALESCE(e.nombre, ''),
               p.tag_id, p.componente_id, p.repuesto_id,
               COALESCE(p.proceso_nombre, ''),
               COALESCE(p.subproceso_nombre, ''),
               COALESCE(p.componente_nombre, ''),
               COALESCE(p.repuesto_nombre, ''),
               COALESCE(p.tag_nombre, ''),
               p.inicio, p.fin, p.duracion_minutos,
               COALESCE(p.personal_responsable, ''),
               COALESCE(p.area_responsable, ''),
               COALESCE(p.motivo, ''),
               p.sync_excel, p.excel_row_id, p.sync_excel_updated_at,
               p.created_at, p.updated_at
        FROM paradas_reportadas p
        LEFT JOIN equipos e ON e.id = p.equipo_id
        WHERE p.inicio >= $1 AND p.inicio < $2
    `
	args := []interface{}{desde, hasta}

	if equipoID != nil && *equipoID > 0 {
		query += ` AND p.equipo_id = $3`
		args = append(args, *equipoID)
	}

	query += ` ORDER BY p.inicio DESC`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanParadas(rows)
}

// ObtenerPorID devuelve una parada o nil si no existe.
func (r *ParadaRepository) ObtenerPorID(id int) (*models.Parada, error) {
	var p models.Parada

	err := r.DB.QueryRow(`
        SELECT p.id, p.equipo_id, COALESCE(e.nombre, ''),
               p.tag_id, p.componente_id, p.repuesto_id,
               COALESCE(p.proceso_nombre, ''),
               COALESCE(p.subproceso_nombre, ''),
               COALESCE(p.componente_nombre, ''),
               COALESCE(p.repuesto_nombre, ''),
               COALESCE(p.tag_nombre, ''),
               p.inicio, p.fin, p.duracion_minutos,
               COALESCE(p.personal_responsable, ''),
               COALESCE(p.area_responsable, ''),
               COALESCE(p.motivo, ''),
               p.sync_excel, p.excel_row_id, p.sync_excel_updated_at,
               p.created_at, p.updated_at
        FROM paradas_reportadas p
        LEFT JOIN equipos e ON e.id = p.equipo_id
        WHERE p.id = $1
    `, id).Scan(
		&p.ID, &p.EquipoID, &p.EquipoNombre,
		&p.TagID, &p.ComponenteID, &p.RepuestoID,
		&p.ProcesoNombre, &p.SubprocesoNombre, &p.ComponenteNombre,
		&p.RepuestoNombre, &p.TagNombre,
		&p.Inicio, &p.Fin, &p.DuracionMinutos,
		&p.PersonalResponsable, &p.AreaResponsable, &p.Motivo,
		&p.SyncExcel, &p.ExcelRowID, &p.SyncExcelUpdatedAt,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// ActualizarResponsable actualiza los campos que rellena el operador.
func (r *ParadaRepository) ActualizarResponsable(
	id int,
	personal, area, motivo string,
) error {
	_, err := r.DB.Exec(`
        UPDATE paradas_reportadas
        SET personal_responsable = $1,
            area_responsable = $2,
            motivo = $3,
            updated_at = NOW()
        WHERE id = $4
    `, nullableString(personal), nullableString(area), nullableString(motivo), id)
	return err
}

// ListarSinSincronizar devuelve las paradas que aún no se han escrito al Excel.
func (r *ParadaRepository) ListarSinSincronizar() ([]models.Parada, error) {
	rows, err := r.DB.Query(`
        SELECT p.id, p.equipo_id, COALESCE(e.nombre, ''),
               p.tag_id, p.componente_id, p.repuesto_id,
               COALESCE(p.proceso_nombre, ''),
               COALESCE(p.subproceso_nombre, ''),
               COALESCE(p.componente_nombre, ''),
               COALESCE(p.repuesto_nombre, ''),
               COALESCE(p.tag_nombre, ''),
               p.inicio, p.fin, p.duracion_minutos,
               COALESCE(p.personal_responsable, ''),
               COALESCE(p.area_responsable, ''),
               COALESCE(p.motivo, ''),
               p.sync_excel, p.excel_row_id, p.sync_excel_updated_at,
               p.created_at, p.updated_at
        FROM paradas_reportadas p
        LEFT JOIN equipos e ON e.id = p.equipo_id
        WHERE p.sync_excel = false
        ORDER BY p.id ASC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanParadas(rows)
}

// MarcarSincronizado marca una parada como escrita en el Excel.
func (r *ParadaRepository) MarcarSincronizado(id int, excelRowID string) error {
	_, err := r.DB.Exec(`
        UPDATE paradas_reportadas
        SET sync_excel = true,
            excel_row_id = $1,
            sync_excel_updated_at = NOW()
        WHERE id = $2
    `, excelRowID, id)
	return err
}

// ActualizarDesdeExcel actualiza el motivo/responsable desde el Excel.
func (r *ParadaRepository) ActualizarDesdeExcel(
	id int,
	personal, area, motivo string,
) error {
	_, err := r.DB.Exec(`
        UPDATE paradas_reportadas
        SET personal_responsable = COALESCE($1, personal_responsable),
            area_responsable = COALESCE($2, area_responsable),
            motivo = COALESCE($3, motivo),
            sync_excel_updated_at = NOW(),
            updated_at = NOW()
        WHERE id = $4
    `, nullableString(personal), nullableString(area), nullableString(motivo), id)
	return err
}

// CrearSyncLog inserta una fila en paradas_sync_log.
func (r *ParadaRepository) CrearSyncLog(log *models.ParadaSyncLog) error {
	return r.DB.QueryRow(`
        INSERT INTO paradas_sync_log (filas_leidas, filas_actualizadas, errores, mensaje)
        VALUES ($1, $2, $3, $4)
        RETURNING id, ejecutado_en
    `,
		log.FilasLeidas,
		log.FilasActualizadas,
		log.Errores,
		nullableString(log.Mensaje),
	).Scan(&log.ID, &log.EjecutadoEn)
}

func scanParadas(rows *sql.Rows) ([]models.Parada, error) {
	var lista []models.Parada
	for rows.Next() {
		var p models.Parada
		if err := rows.Scan(
			&p.ID, &p.EquipoID, &p.EquipoNombre,
			&p.TagID, &p.ComponenteID, &p.RepuestoID,
			&p.ProcesoNombre, &p.SubprocesoNombre, &p.ComponenteNombre,
			&p.RepuestoNombre, &p.TagNombre,
			&p.Inicio, &p.Fin, &p.DuracionMinutos,
			&p.PersonalResponsable, &p.AreaResponsable, &p.Motivo,
			&p.SyncExcel, &p.ExcelRowID, &p.SyncExcelUpdatedAt,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		lista = append(lista, p)
	}
	return lista, rows.Err()
}
