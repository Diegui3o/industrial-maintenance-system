// repository/pi_tag_repository.go
package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"backend/models"
)

type PITagRepository struct {
	DB *sql.DB
}

func NewPITagRepository(db *sql.DB) *PITagRepository {
	return &PITagRepository{DB: db}
}

func (r *PITagRepository) GetTagsSinEquipo() ([]models.PITagDiscovery, error) {
	query := `
		SELECT
			tag_name,
			COALESCE(unidad, '') AS unidad,
			frecuencia,
			ultimo_valor,
			ultima_actualizacion
		FROM tags_descubiertos
		WHERE equipo_id IS NULL
		  AND tag_name IS NOT NULL
		  AND tag_name != ''
		ORDER BY tag_name
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []models.PITagDiscovery

	for rows.Next() {
		var t models.PITagDiscovery
		var ultimoValor sql.NullFloat64
		var ultimaActualizacion sql.NullTime

		if err := rows.Scan(
			&t.Parametro,
			&t.Unidad,
			&t.Frecuencia,
			&ultimoValor,
			&ultimaActualizacion,
		); err != nil {
			return nil, err
		}

		if ultimoValor.Valid {
			t.UltimoValor = ultimoValor.Float64
		}

		if ultimaActualizacion.Valid {
			t.UltimaActualizacion = ultimaActualizacion.Time
		}

		tags = append(tags, t)
	}

	return tags, rows.Err()
}

func (r *PITagRepository) GetSugerenciasAgrupacion() ([]models.PITagSugerencia, error) {
	query := `
		WITH tag_groups AS (
			SELECT
				SUBSTRING(tag_name FROM '^[^_]+') AS prefijo,
				ARRAY_AGG(DISTINCT tag_name ORDER BY tag_name) AS tags,
				ARRAY_AGG(DISTINCT COALESCE(unidad, '') ORDER BY COALESCE(unidad, '')) AS unidades,
				COUNT(DISTINCT tag_name) AS cantidad
			FROM tags_descubiertos
			WHERE equipo_id IS NULL
			  AND tag_name IS NOT NULL
			  AND tag_name != ''
			GROUP BY SUBSTRING(tag_name FROM '^[^_]+')
			HAVING COUNT(DISTINCT tag_name) > 1
		)
		SELECT
			prefijo,
			cantidad,
			tags,
			unidades,
			CONCAT('Equipo ', prefijo) AS equipo_sugerido
		FROM tag_groups
		ORDER BY cantidad DESC, prefijo
	`

	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sugerencias []models.PITagSugerencia

	for rows.Next() {
		var s models.PITagSugerencia
		var tagsArray, unidadesArray string

		if err := rows.Scan(
			&s.Prefijo,
			&s.Cantidad,
			&tagsArray,
			&unidadesArray,
			&s.EquipoSugerido,
		); err != nil {
			return nil, err
		}

		s.Tags = parseStringArray(tagsArray)
		s.Unidades = parseStringArray(unidadesArray)

		sugerencias = append(sugerencias, s)
	}

	return sugerencias, rows.Err()
}

// AsignarTagsEquipo - Asigna tags a un equipo
func (r *PITagRepository) AsignarTagsEquipo(equipoID int, tags []string) error {
	if len(tags) == 0 {
		return fmt.Errorf("no hay tags para asignar")
	}

	placeholders := make([]string, len(tags))
	args := make([]interface{}, len(tags)+1)

	args[0] = equipoID

	for i, tag := range tags {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = tag
	}

	query := fmt.Sprintf(`
		UPDATE tags_descubiertos
		SET
			equipo_id = $1,
			asignado_automaticamente = FALSE,
			actualizado_en = NOW()
		WHERE tag_name IN (%s)
		  AND equipo_id IS NULL
	`, strings.Join(placeholders, ", "))

	_, err := r.DB.Exec(query, args...)
	return err
}

func (r *PITagRepository) GetTagsByEquipo(equipoID int) ([]models.PITagEquipo, error) {
	query := `
		SELECT
			e.id AS equipo_id,
			e.nombre AS equipo_nombre,
			ARRAY_AGG(DISTINCT td.tag_name ORDER BY td.tag_name) AS tags,
			COUNT(DISTINCT td.tag_name) AS total_tags
		FROM equipos e
		LEFT JOIN tags_descubiertos td
			ON e.id = td.equipo_id
		WHERE e.id = $1
		GROUP BY e.id, e.nombre
	`

	var result models.PITagEquipo
	var tagsArray string

	err := r.DB.QueryRow(query, equipoID).Scan(
		&result.EquipoID,
		&result.EquipoNombre,
		&tagsArray,
		&result.TotalTags,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	result.Tags = parseStringArray(tagsArray)

	return []models.PITagEquipo{result}, nil
}

// parseStringArray - Convierte array de PostgreSQL a slice de strings
func parseStringArray(arr string) []string {
	if len(arr) < 2 {
		return []string{}
	}
	// Remover llaves {} y dividir por comas
	content := arr[1 : len(arr)-1]
	if content == "" {
		return []string{}
	}
	parts := strings.Split(content, ",")
	for i, p := range parts {
		parts[i] = strings.TrimSpace(p)
		parts[i] = strings.Trim(parts[i], `"`)
	}
	return parts
}
