package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

// ============================================
// TagDescubiertoHandler
// ============================================
type TagDescubiertoHandler struct {
	Repo *repository.TagDescubiertoRepository
}

func NewTagDescubiertoHandler(repo *repository.TagDescubiertoRepository) *TagDescubiertoHandler {
	return &TagDescubiertoHandler{Repo: repo}
}

// ============================================
// GET /api/pi/tags/descubiertos
// ============================================
// Lista todos los tags descubiertos sin equipo asignado
func (h *TagDescubiertoHandler) GetTagsDescubiertos(w http.ResponseWriter, r *http.Request) {
	tags, err := h.Repo.GetSinEquipo()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags descubiertos: "+err.Error())
		return
	}
	if tags == nil {
		tags = []models.TagDescubierto{}
	}
	utils.SuccessJSON(w, http.StatusOK, tags)
}

// ============================================
// GET /api/pi/tags/descubiertos/{id}
// ============================================
// Obtiene un tag descubierto por ID
func (h *TagDescubiertoHandler) GetTagDescubierto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	tag, err := h.Repo.GetByID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tag: "+err.Error())
		return
	}
	if tag == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "Tag no encontrado")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, tag)
}

// ============================================
// POST /api/pi/tags/asignar
// ============================================
// Asigna un tag descubierto a un equipo
func (h *TagDescubiertoHandler) AsignarTag(w http.ResponseWriter, r *http.Request) {
	var data struct {
		TagID    int `json:"tag_id"`
		EquipoID int `json:"equipo_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	if data.TagID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "tag_id debe ser mayor a 0")
		return
	}
	if data.EquipoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id debe ser mayor a 0")
		return
	}

	// Verificar que el equipo existe
	existe, err := h.Repo.ExisteEquipo(data.EquipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error verificando equipo: "+err.Error())
		return
	}
	if !existe {
		utils.ErrorJSON(w, http.StatusBadRequest, "El equipo no existe")
		return
	}

	// Asignar tag al equipo
	err = h.Repo.AsignarAEquipo(data.TagID, data.EquipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error asignando tag: "+err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":   "Tag asignado correctamente",
		"tag_id":    data.TagID,
		"equipo_id": data.EquipoID,
	})
}

// ============================================
// DELETE /api/pi/tags/descubiertos/{id}
// ============================================
// Elimina un tag descubierto (si fue asignado por error o es spam)
func (h *TagDescubiertoHandler) EliminarTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	err = h.Repo.Eliminar(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error eliminando tag: "+err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Tag eliminado correctamente"})
}

func (h *TagDescubiertoHandler) AsignarMultiplesTags(w http.ResponseWriter, r *http.Request) {
	var data struct {
		TagIDs   []int `json:"tag_ids"`
		EquipoID int   `json:"equipo_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	if len(data.TagIDs) == 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "Se requiere al menos un tag_id")
		return
	}

	if data.EquipoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id debe ser mayor a 0")
		return
	}

	existe, err := h.Repo.ExisteEquipo(data.EquipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError,
			"Error verificando equipo: "+err.Error())
		return
	}

	if !existe {
		utils.ErrorJSON(w, http.StatusBadRequest, "El equipo no existe")
		return
	}

	asignados := 0
	errores := []string{}

	for _, tagID := range data.TagIDs {
		err := h.Repo.AsignarAEquipo(tagID, data.EquipoID)

		if err != nil {
			errores = append(
				errores,
				strconv.Itoa(tagID)+": "+err.Error(),
			)
		} else {
			asignados++
		}
	}

	response := map[string]interface{}{
		"mensaje":   "Tags asignados",
		"asignados": asignados,
		"total":     len(data.TagIDs),
	}

	if len(errores) > 0 {
		response["errores"] = errores
	}

	utils.SuccessJSON(w, http.StatusOK, response)
}
