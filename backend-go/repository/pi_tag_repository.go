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

// GetTagsSinEquipo - Obtiene tags de PI System sin equipo asignado
func (r *PITagRepository) GetTagsSinEquipo() ([]models.PITagDiscovery, error) {
	query := `
        SELECT 
            parametro,
            unidad,
            COUNT(*) as frecuencia,
            MAX(valor) as ultimo_valor,
            MAX(recibido_en) as ultima_actualizacion
        FROM datos_sensores 
        WHERE (equipo_id = 0 OR equipo_id IS NULL)
            AND fuente = 'PI_System'
            AND parametro IS NOT NULL 
            AND parametro != ''
        GROUP BY parametro, unidad
        ORDER BY parametro
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

		if err := rows.Scan(&t.Parametro, &t.Unidad, &t.Frecuencia,
			&ultimoValor, &ultimaActualizacion); err != nil {
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

// GetSugerenciasAgrupacion - Obtiene sugerencias de agrupación automática
func (r *PITagRepository) GetSugerenciasAgrupacion() ([]models.PITagSugerencia, error) {
	query := `
        WITH tag_groups AS (
            SELECT 
                SUBSTRING(parametro FROM '^[^_]+') as prefijo,
                ARRAY_AGG(DISTINCT parametro ORDER BY parametro) as tags,
                ARRAY_AGG(DISTINCT unidad ORDER BY unidad) as unidades,
                COUNT(DISTINCT parametro) as cantidad
            FROM datos_sensores 
            WHERE (equipo_id = 0 OR equipo_id IS NULL)
                AND fuente = 'PI_System'
                AND parametro IS NOT NULL 
                AND parametro != ''
            GROUP BY SUBSTRING(parametro FROM '^[^_]+')
            HAVING COUNT(DISTINCT parametro) > 1
        )
        SELECT 
            prefijo,
            cantidad,
            tags,
            unidades,
            CONCAT('Equipo ', prefijo) as equipo_sugerido
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

		if err := rows.Scan(&s.Prefijo, &s.Cantidad, &tagsArray, &unidadesArray, &s.EquipoSugerido); err != nil {
			return nil, err
		}

		// Parsear arrays de PostgreSQL
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

	// Crear placeholders para la consulta
	placeholders := make([]string, len(tags))
	args := make([]interface{}, len(tags)+1)
	args[0] = equipoID

	for i, tag := range tags {
		placeholders[i] = fmt.Sprintf("$%d", i+2)
		args[i+1] = tag
	}

	query := fmt.Sprintf(`
        UPDATE datos_sensores 
        SET equipo_id = $1 
        WHERE parametro IN (%s) 
            AND (equipo_id = 0 OR equipo_id IS NULL)
            AND fuente = 'PI_System'
    `, strings.Join(placeholders, ", "))

	_, err := r.DB.Exec(query, args...)
	return err
}

// GetTagsByEquipo - Obtiene tags asignados a un equipo
func (r *PITagRepository) GetTagsByEquipo(equipoID int) ([]models.PITagEquipo, error) {
	query := `
        SELECT 
            e.id as equipo_id,
            e.nombre as equipo_nombre,
            ARRAY_AGG(DISTINCT ds.parametro ORDER BY ds.parametro) as tags,
            COUNT(DISTINCT ds.parametro) as total_tags
        FROM equipos e
        LEFT JOIN datos_sensores ds ON e.id = ds.equipo_id
        WHERE e.id = $1
            AND ds.fuente = 'PI_System'
            AND ds.parametro IS NOT NULL
        GROUP BY e.id, e.nombre
    `

	var result models.PITagEquipo
	var tagsArray string

	err := r.DB.QueryRow(query, equipoID).Scan(
		&result.EquipoID, &result.EquipoNombre, &tagsArray, &result.TotalTags)

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
