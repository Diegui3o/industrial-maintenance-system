package handlers

import (
	"log"
	"net/http"
	"strconv"

	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type EquipoTagHandler struct {
	TagDescubiertoRepo *repository.TagDescubiertoRepository
}

func NewEquipoTagHandler(
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *EquipoTagHandler {
	return &EquipoTagHandler{
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
}

func (h *EquipoTagHandler) GetTagsByEquipo(w http.ResponseWriter, r *http.Request) {
	log.Println("🚀 GetTagsByEquipo EJECUTADO para equipo ID:", r.URL.Path)
	log.Println("🔍 GetTagsByEquipo llamado") // ← AGREGAR

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		log.Printf("❌ Error convirtiendo ID: %v", err) // ← AGREGAR
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	log.Printf("🔍 Buscando tags para equipo ID: %d", id) // ← AGREGAR

	if h.TagDescubiertoRepo == nil {
		log.Println("❌ TagDescubiertoRepo es nil") // ← AGREGAR
		utils.ErrorJSON(w, http.StatusInternalServerError, "Repositorio no inicializado")
		return
	}

	// Buscar en tags_descubiertos
	rows, err := h.TagDescubiertoRepo.DB.Query(`
        SELECT tag_name, unidad, ultimo_valor, ultima_actualizacion
        FROM tags_descubiertos
        WHERE equipo_id = $1
        ORDER BY tag_name
    `, id)
	if err != nil {
		log.Printf("❌ Error en Query: %v", err) // ← AGREGAR
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags: "+err.Error())
		return
	}
	defer rows.Close()

	log.Println("✅ Query ejecutada correctamente") // ← AGREGAR

	var tags []map[string]interface{}
	for rows.Next() {
		var tagName, unidad string
		var ultimoValor float64
		var ultimaActualizacion interface{}
		if err := rows.Scan(&tagName, &unidad, &ultimoValor, &ultimaActualizacion); err != nil {
			log.Printf("❌ Error en Scan: %v", err) // ← AGREGAR
			continue
		}
		tags = append(tags, map[string]interface{}{
			"tag_name":       tagName,
			"unidad":         unidad,
			"ultimo_valor":   ultimoValor,
			"actualizado_en": ultimaActualizacion,
		})
	}

	if err := rows.Err(); err != nil {
		log.Printf("❌ Error en rows.Err(): %v", err) // ← AGREGAR
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error iterando resultados")
		return
	}

	log.Printf("✅ Tags encontrados: %d", len(tags)) // ← AGREGAR

	utils.SuccessJSON(w, http.StatusOK, tags)
}

// GetTiempoReal - GET /api/equipos/{id}/tiempo-real
func (h *EquipoTagHandler) GetTiempoReal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	rows, err := h.TagDescubiertoRepo.DB.Query(`
		SELECT tag_name, unidad, ultimo_valor, ultima_actualizacion
		FROM tags_descubiertos
		WHERE equipo_id = $1
		ORDER BY tag_name
	`, id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo datos: "+err.Error())
		return
	}
	defer rows.Close()

	var datos []map[string]interface{}
	for rows.Next() {
		var tagName, unidad string
		var ultimoValor float64
		var ultimaActualizacion interface{}
		if err := rows.Scan(&tagName, &unidad, &ultimoValor, &ultimaActualizacion); err != nil {
			continue
		}
		datos = append(datos, map[string]interface{}{
			"parametro":      tagName,
			"valor":          ultimoValor,
			"unidad":         unidad,
			"actualizado_en": ultimaActualizacion,
		})
	}

	if err := rows.Err(); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error iterando resultados")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, datos)
}
