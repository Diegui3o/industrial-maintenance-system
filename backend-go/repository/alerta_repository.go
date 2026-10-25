package repository

import (
	"database/sql"

	"backend/models"
)

type AlertaRepository struct {
	DB *sql.DB
}

func NewAlertaRepository(db *sql.DB) *AlertaRepository {
	return &AlertaRepository{DB: db}
}

func (r *AlertaRepository) Crear(a *models.Alerta) error {
	return r.DB.QueryRow(`
        INSERT INTO alertas (
            equipo_id, componente_id, repuesto_id, tag_id,
            parametro, activo_tipo, mensaje, severidad,
            valor_detectado, umbral_min, umbral_max
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, fecha_generada
    `,
		a.EquipoID,
		a.ComponenteID,
		a.RepuestoID,
		a.TagID,
		a.Parametro,
		nullableString(a.ActivoTipo),
		a.Mensaje,
		a.Severidad,
		a.ValorDetectado,
		a.UmbralMin,
		a.UmbralMax,
	).Scan(&a.ID, &a.FechaGenerada)
}

func (r *AlertaRepository) ExisteAlertaActiva(
	equipoID int,
	componenteID *int,
	repuestoID *int,
	tagID *int,
	parametro *string,
) (bool, error) {
	var existe bool
	err := r.DB.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM alertas
            WHERE estado = 'activa'
              AND COALESCE(equipo_id, 0) = COALESCE($1, 0)
              AND COALESCE(componente_id, 0) = COALESCE($2, 0)
              AND COALESCE(repuesto_id, 0) = COALESCE($3, 0)
              AND COALESCE(tag_id, 0) = COALESCE($4, 0)
              AND COALESCE(parametro, '') = COALESCE($5, '')
        )
    `, equipoID, componenteID, repuestoID, tagID, parametro).Scan(&existe)
	return existe, err
}

func (r *AlertaRepository) ListarActivas() ([]models.Alerta, error) {
	rows, err := r.DB.Query(`
        SELECT id, equipo_id, componente_id, repuesto_id, tag_id,
               parametro, activo_tipo, mensaje, severidad, estado,
               valor_detectado, umbral_min, umbral_max,
               fecha_generada, fecha_vista
        FROM alertas
        WHERE estado = 'activa'
        ORDER BY
            CASE severidad
                WHEN 'critica' THEN 1
                WHEN 'alta'    THEN 2
                WHEN 'media'   THEN 3
                WHEN 'baja'    THEN 4
            END,
            fecha_generada DESC
        LIMIT 200
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lista []models.Alerta
	for rows.Next() {
		var a models.Alerta
		if err := rows.Scan(
			&a.ID, &a.EquipoID, &a.ComponenteID, &a.RepuestoID, &a.TagID,
			&a.Parametro, &a.ActivoTipo, &a.Mensaje, &a.Severidad, &a.Estado,
			&a.ValorDetectado, &a.UmbralMin, &a.UmbralMax,
			&a.FechaGenerada, &a.FechaVista,
		); err != nil {
			return nil, err
		}
		lista = append(lista, a)
	}
	return lista, rows.Err()
}