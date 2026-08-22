// repository/tag_descubierto_repository.go

package repository

import (
	"database/sql"

	"backend/models"
)

type TagDescubiertoRepository struct {
	DB *sql.DB
}

func NewTagDescubiertoRepository(db *sql.DB) *TagDescubiertoRepository {
	return &TagDescubiertoRepository{DB: db}
}

// ============================================
// GET BY ID
// ============================================
func (r *TagDescubiertoRepository) GetByID(id int) (*models.TagDescubierto, error) {
	var t models.TagDescubierto
	err := r.DB.QueryRow(`
		SELECT id, tag_name, tag_path, element_name, element_path,
		       pi_point_name, unidad, ultimo_valor, ultima_actualizacion,
		       frecuencia, source, equipment_id, asignado_automaticamente,
		       creado_en, actualizado_en
		FROM tags_descubiertos
		WHERE id = $1
	`, id).Scan(
		&t.ID, &t.TagName, &t.TagPath, &t.ElementName, &t.ElementPath,
		&t.PIPointName, &t.Unidad, &t.UltimoValor, &t.UltimaActualizacion,
		&t.Frecuencia, &t.Source, &t.EquipmentID, &t.AsignadoAutomaticamente,
		&t.CreadoEn, &t.ActualizadoEn,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

// ============================================
// EXISTE EQUIPO
// ============================================
func (r *TagDescubiertoRepository) ExisteEquipo(id int) (bool, error) {
	var existe bool
	err := r.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM equipos WHERE id = $1)", id).Scan(&existe)
	return existe, err
}

// ============================================
// ELIMINAR TAG
// ============================================
func (r *TagDescubiertoRepository) Eliminar(id int) error {
	_, err := r.DB.Exec("DELETE FROM tags_descubiertos WHERE id = $1", id)
	return err
}

// ============================================
// GUARDAR O ACTUALIZAR TAG DESCUBIERTO
// ============================================
func (r *TagDescubiertoRepository) Upsert(tag *models.TagDescubierto) error {
	return r.DB.QueryRow(`
		INSERT INTO tags_descubiertos (
			tag_name, tag_path, element_name, element_path, 
			pi_point_name, unidad, ultimo_valor, ultima_actualizacion,
			frecuencia, source, equipment_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, NULL)
		ON CONFLICT (tag_name) DO UPDATE SET
			ultimo_valor = EXCLUDED.ultimo_valor,
			ultima_actualizacion = EXCLUDED.ultima_actualizacion,
			frecuencia = tags_descubiertos.frecuencia + 1,
			actualizado_en = NOW()
		RETURNING id
	`, tag.TagName, tag.TagPath, tag.ElementName, tag.ElementPath,
		tag.PIPointName, tag.Unidad, tag.UltimoValor, tag.UltimaActualizacion,
		tag.Source).Scan(&tag.ID)
}

// ============================================
// OBTENER TODOS LOS TAGS SIN EQUIPO
// ============================================
func (r *TagDescubiertoRepository) GetSinEquipo() ([]models.TagDescubierto, error) {
	rows, err := r.DB.Query(`
		SELECT id, tag_name, tag_path, element_name, element_path,
		       pi_point_name, unidad, ultimo_valor, ultima_actualizacion,
		       frecuencia, source, equipment_id, asignado_automaticamente,
		       creado_en, actualizado_en
		FROM tags_descubiertos
		WHERE equipment_id IS NULL
		ORDER BY frecuencia DESC, tag_name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []models.TagDescubierto
	for rows.Next() {
		var t models.TagDescubierto
		if err := rows.Scan(&t.ID, &t.TagName, &t.TagPath, &t.ElementName,
			&t.ElementPath, &t.PIPointName, &t.Unidad, &t.UltimoValor,
			&t.UltimaActualizacion, &t.Frecuencia, &t.Source,
			&t.EquipmentID, &t.AsignadoAutomaticamente,
			&t.CreadoEn, &t.ActualizadoEn); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, rows.Err()
}

// ============================================
// ASIGNAR TAG A EQUIPO
// ============================================
func (r *TagDescubiertoRepository) AsignarAEquipo(tagName string, equipoID int) error {
	_, err := r.DB.Exec(`
		UPDATE tags_descubiertos 
		SET equipment_id = $1, asignado_automaticamente = FALSE, actualizado_en = NOW()
		WHERE tag_name = $2
	`, equipoID, tagName)
	return err
}
