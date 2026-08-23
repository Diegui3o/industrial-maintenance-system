// repository/tag_descubierto_repository.go

package repository

import (
	"database/sql"
	"log"

	"backend/models"

	"github.com/lib/pq"
)

type TagDescubiertoRepository struct {
	DB *sql.DB
}

func NewTagDescubiertoRepository(db *sql.DB) *TagDescubiertoRepository {
	return &TagDescubiertoRepository{DB: db}
}

func (r *TagDescubiertoRepository) GetByID(id int) (*models.TagDescubierto, error) {
	var t models.TagDescubierto
	err := r.DB.QueryRow(`
		SELECT id, tag_name, tag_path, element_name, element_path,
			pi_point_name, pi_server, database_name, root_element,
			unidad, ultimo_valor, ultima_actualizacion,
			frecuencia, source, quality,
			equipo_id, asignado_automaticamente,
			creado_en, actualizado_en,
			ruta_completa, nivel_jerarquico, elemento_padre,
			path_jerarquico, elementos_ancestros
        FROM tags_descubiertos
        WHERE id = $1
    `, id).Scan(
		&t.ID,
		&t.TagName,
		&t.TagPath,
		&t.ElementName,
		&t.ElementPath,
		&t.PIPointName,
		&t.PiServer,
		&t.DatabaseName,
		&t.RootElement,
		&t.Unidad,
		&t.UltimoValor,
		&t.UltimaActualizacion,
		&t.Frecuencia,
		&t.Source,
		&t.Quality,
		&t.EquipoID,
		&t.AsignadoAutomaticamente,
		&t.CreadoEn,
		&t.ActualizadoEn,
		&t.RutaCompleta,
		&t.NivelJerarquico,
		&t.ElementoPadre,
		&t.PathJerarquico,
		&t.ElementosAncestros,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &t, err
}

func (r *TagDescubiertoRepository) ExisteEquipo(id int) (bool, error) {
	var existe bool
	err := r.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM equipos WHERE id = $1)", id).Scan(&existe)
	return existe, err
}

func (r *TagDescubiertoRepository) Eliminar(id int) error {
	_, err := r.DB.Exec("DELETE FROM tags_descubiertos WHERE id = $1", id)
	return err
}

func (r *TagDescubiertoRepository) Upsert(tag *models.TagDescubierto) error {
	// ============================================
	// LOG PARA VER LOS VALORES
	// ============================================
	log.Printf("🔍 Upsert: Tag=%s, Ruta=%s, Nivel=%d",
		tag.TagName,
		tag.RutaCompleta,
		tag.NivelJerarquico)

	var id int
	err := r.DB.QueryRow(`
		INSERT INTO tags_descubiertos (
			tag_name,
			tag_path,
			element_name,
			element_path,
			pi_point_name,
			pi_server,
			database_name,
			root_element,
			unidad,
			ultimo_valor,
			ultima_actualizacion,
			frecuencia,
			source,
			ruta_completa,
			nivel_jerarquico,
			elemento_padre,
			path_jerarquico,
			elementos_ancestros
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			$11, 1, $12, $13, $14, $15, $16, $17
		)
		ON CONFLICT (tag_name, element_path, pi_point_name) DO UPDATE SET
			tag_path = COALESCE(EXCLUDED.tag_path, tags_descubiertos.tag_path),
			element_name = COALESCE(EXCLUDED.element_name, tags_descubiertos.element_name),
			element_path = COALESCE(EXCLUDED.element_path, tags_descubiertos.element_path),
			pi_point_name = COALESCE(EXCLUDED.pi_point_name, tags_descubiertos.pi_point_name),
			pi_server = COALESCE(EXCLUDED.pi_server, tags_descubiertos.pi_server),
			database_name = COALESCE(EXCLUDED.database_name, tags_descubiertos.database_name),
			root_element = COALESCE(EXCLUDED.root_element, tags_descubiertos.root_element),
			unidad = COALESCE(EXCLUDED.unidad, tags_descubiertos.unidad),
			ultimo_valor = EXCLUDED.ultimo_valor,
			ultima_actualizacion = EXCLUDED.ultima_actualizacion,
			frecuencia = tags_descubiertos.frecuencia + 1,
			actualizado_en = NOW(),
			ruta_completa = COALESCE(EXCLUDED.ruta_completa, tags_descubiertos.ruta_completa),
			nivel_jerarquico = COALESCE(EXCLUDED.nivel_jerarquico, tags_descubiertos.nivel_jerarquico),
			elemento_padre = COALESCE(EXCLUDED.elemento_padre, tags_descubiertos.elemento_padre),
			path_jerarquico = COALESCE(EXCLUDED.path_jerarquico, tags_descubiertos.path_jerarquico),
			elementos_ancestros = COALESCE(EXCLUDED.elementos_ancestros, tags_descubiertos.elementos_ancestros)
		RETURNING id
	`,
		tag.TagName,
		tag.TagPath,
		tag.ElementName,
		tag.ElementPath,
		tag.PIPointName,
		tag.PiServer,
		tag.DatabaseName,
		tag.RootElement,
		tag.Unidad,
		tag.UltimoValor,
		tag.UltimaActualizacion,
		tag.Source,
		tag.RutaCompleta,
		tag.NivelJerarquico,
		tag.ElementoPadre,
		tag.PathJerarquico,
		tag.ElementosAncestros,
	).Scan(&id)

	if err != nil {
		log.Printf("❌ Upsert ERROR: %v", err)
		return err
	}

	tag.ID = id
	log.Printf("✅ Upsert exitoso: ID=%d, Tag=%s", id, tag.TagName)
	return nil
}

func (r *TagDescubiertoRepository) GetSinEquipo() ([]models.TagDescubierto, error) {
	rows, err := r.DB.Query(`
		SELECT id, tag_name, tag_path, element_name, element_path,
			pi_point_name, unidad, ultimo_valor, ultima_actualizacion,
			frecuencia, source, equipo_id, asignado_automaticamente,
			creado_en, actualizado_en
		FROM tags_descubiertos
		WHERE equipo_id IS NULL
		ORDER BY frecuencia DESC, tag_name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []models.TagDescubierto

	for rows.Next() {
		var t models.TagDescubierto

		var (
			tagPath      sql.NullString
			elementName  sql.NullString
			elementPath  sql.NullString
			piPointName  sql.NullString
			unidad       sql.NullString
			source       sql.NullString
			equipoID     sql.NullInt64
			ultimoValor  sql.NullFloat64
			ultimaActual sql.NullTime
		)

		if err := rows.Scan(
			&t.ID,
			&t.TagName,
			&tagPath,
			&elementName,
			&elementPath,
			&piPointName,
			&unidad,
			&ultimoValor,
			&ultimaActual,
			&t.Frecuencia,
			&source,
			&equipoID,
			&t.AsignadoAutomaticamente,
			&t.CreadoEn,
			&t.ActualizadoEn,
		); err != nil {
			return nil, err
		}

		t.TagPath = tagPath.String
		t.ElementName = elementName.String
		t.ElementPath = elementPath.String
		t.PIPointName = piPointName.String
		t.Unidad = unidad.String
		t.Source = source.String

		if equipoID.Valid {
			id := int(equipoID.Int64)
			t.EquipoID = &id
		}

		if ultimoValor.Valid {
			t.UltimoValor = ultimoValor.Float64
		}

		if ultimaActual.Valid {
			t.UltimaActualizacion = ultimaActual.Time
		}

		tags = append(tags, t)
	}

	return tags, rows.Err()
}

func (r *TagDescubiertoRepository) AsignarAEquipo(tagID int, equipoID int) error {
	_, err := r.DB.Exec(`
		UPDATE tags_descubiertos
		SET equipo_id = $1,
			asignado_automaticamente = FALSE,
			actualizado_en = NOW()
		WHERE id = $2
	`, equipoID, tagID)

	return err
}

// ObtenerTagsAgrupados - Retorna sugerencias de equipos
func (r *TagDescubiertoRepository) ObtenerTagsAgrupados() ([]models.TagAgrupado, error) {
	rows, err := r.DB.Query(`
        SELECT 
            element_name,
            element_path,
            total_tags,
            tags,
            unidades,
            ultimo_valor_max,
            ultima_actualizacion
        FROM vw_sugerencias_equipos
        ORDER BY total_tags DESC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var resultados []models.TagAgrupado
	for rows.Next() {
		var t models.TagAgrupado
		var tagsArray, unidadesArray string
		err := rows.Scan(
			&t.ElementName,
			&t.ElementPath,
			&t.TotalTags,
			&tagsArray,
			&unidadesArray,
			&t.UltimoValorMax,
			&t.UltimaActualizacion,
		)
		if err != nil {
			return nil, err
		}
		// Convertir arrays de PostgreSQL a slices
		t.Tags = parseStringArray(tagsArray)
		t.Unidades = parseStringArray(unidadesArray)
		resultados = append(resultados, t)
	}
	return resultados, rows.Err()
}

func (r *TagDescubiertoRepository) AsignarTagsAEquipo(
	equipoID int,
	tagNames []string,
) (int, error) {
	var count int

	err := r.DB.QueryRow(`
		SELECT asignar_tags_a_equipo($1, $2)
	`, equipoID, tagNames).Scan(&count)

	return count, err
}

func (r *TagDescubiertoRepository) AsignarTagsAEquipoPorIDs(
	equipoID int,
	tagIDs []int,
) (int, error) {
	var count int

	err := r.DB.QueryRow(`
                SELECT asignar_tags_a_equipo_ids($1, $2)
        `, equipoID, pq.Array(tagIDs)).Scan(&count)

	return count, err
}

func (r *TagDescubiertoRepository) ObtenerFuentesDisponibles() ([]models.FuenteDisponible, error) {
	rows, err := r.DB.Query(`
        SELECT pi_server, database_name, total_tags
        FROM obtener_fuentes_disponibles()
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var fuentes []models.FuenteDisponible
	for rows.Next() {
		var f models.FuenteDisponible
		err := rows.Scan(&f.PiServer, &f.DatabaseName, &f.TotalTags)
		if err != nil {
			return nil, err
		}
		fuentes = append(fuentes, f)
	}
	return fuentes, rows.Err()
}
func (r *TagDescubiertoRepository) ObtenerTagsPorFuente(
	fuente string,
) ([]models.TagDescubierto, error) {

	query := `
		SELECT
			id,
			tag_name,
			tag_path,
			element_name,
			element_path,
			pi_point_name,
			pi_server,
			database_name,
			root_element,
			unidad,
			ultimo_valor,
			ultima_actualizacion,
			frecuencia,
			source,
			equipo_id,
			asignado_automaticamente,
			creado_en,
			actualizado_en,
			ruta_completa,
			nivel_jerarquico,
			elemento_padre,
			path_jerarquico,
			elementos_ancestros
		FROM tags_descubiertos
		WHERE pi_server = $1
		ORDER BY ruta_completa, tag_name
	`

	rows, err := r.DB.Query(query, fuente)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []models.TagDescubierto

	for rows.Next() {
		var t models.TagDescubierto

		err := rows.Scan(
			&t.ID,
			&t.TagName,
			&t.TagPath,
			&t.ElementName,
			&t.ElementPath,
			&t.PIPointName,
			&t.PiServer,
			&t.DatabaseName,
			&t.RootElement,
			&t.Unidad,
			&t.UltimoValor,
			&t.UltimaActualizacion,
			&t.Frecuencia,
			&t.Source,
			&t.EquipoID,
			&t.AsignadoAutomaticamente,
			&t.CreadoEn,
			&t.ActualizadoEn,
			&t.RutaCompleta,
			&t.NivelJerarquico,
			&t.ElementoPadre,
			&t.PathJerarquico,
			&t.ElementosAncestros,
		)

		if err != nil {
			return nil, err
		}

		tags = append(tags, t)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return tags, nil
}

func (r *TagDescubiertoRepository) ObtenerEquipoIDPorTag(
	tagName string,
	elementPath string,
	piPointName string,
) (*int, error) {

	log.Printf(
		"🔎 Buscando asignación: Tag=%s | ElementPath=%s | PIPoint=%s",
		tagName,
		elementPath,
		piPointName,
	)

	var equipoID sql.NullInt64

	err := r.DB.QueryRow(`
		SELECT equipo_id
		FROM tags_descubiertos
		WHERE tag_name = $1
		  AND element_path = $2
		  AND pi_point_name = $3
		  AND equipo_id IS NOT NULL
		LIMIT 1
	`,
		tagName,
		elementPath,
		piPointName,
	).Scan(&equipoID)

	if err == sql.ErrNoRows {
		log.Printf(
			"🔎 Sin asignación encontrada: Tag=%s | PIPoint=%s",
			tagName,
			piPointName,
		)
		return nil, nil
	}

	if err != nil {
		log.Printf(
			"❌ Error consultando asignación: Tag=%s | PIPoint=%s | Error=%v",
			tagName,
			piPointName,
			err,
		)
		return nil, err
	}

	if !equipoID.Valid {
		return nil, nil
	}

	id := int(equipoID.Int64)

	log.Printf(
		"✅ ASIGNACIÓN ENCONTRADA: Tag=%s | PIPoint=%s → EquipoID=%d",
		tagName,
		piPointName,
		id,
	)

	return &id, nil
}
