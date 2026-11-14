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

type TagDescubiertoHandler struct {
	Repo *repository.TagDescubiertoRepository
}

func NewTagDescubiertoHandler(repo *repository.TagDescubiertoRepository) *TagDescubiertoHandler {
	return &TagDescubiertoHandler{Repo: repo}
}

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

func (h *TagDescubiertoHandler) GetTagDescubierto(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID invÃ¡lido")
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

func (h *TagDescubiertoHandler) AsignarTag(w http.ResponseWriter, r *http.Request) {
	var data struct {
		TagID    int `json:"tag_id"`
		EquipoID int `json:"equipo_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invÃ¡lido: "+err.Error())
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

func (h *TagDescubiertoHandler) EliminarTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID invÃ¡lido")
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
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invÃ¡lido: "+err.Error())
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
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			"Error verificando equipo: "+err.Error(),
		)
		return
	}

	if !existe {
		utils.ErrorJSON(w, http.StatusBadRequest, "El equipo no existe")
		return
	}

	asignados, err := h.Repo.AsignarTagsAEquipoPorIDs(
		data.EquipoID,
		data.TagIDs,
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			"Error asignando tags: "+err.Error(),
		)
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":   "Tags asignados",
		"asignados": asignados,
		"total":     len(data.TagIDs),
	})
}
	// POST /api/pi/tags/sync
	// Body: array de TagDescubierto
	// Hace Upsert masivo de todos los tags descubiertos en PI.
	func (h *TagDescubiertoHandler) SincronizarCatalogo(w http.ResponseWriter, r *http.Request) {
		var tags []models.TagDescubierto
		if err := json.NewDecoder(r.Body).Decode(&tags); err != nil {
			utils.ErrorJSON(w, http.StatusBadRequest, "JSON invÃ¡lido: "+err.Error())
			return
		}

		if len(tags) == 0 {
			utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
				"total": 0, "insertados": 0, "errores": 0,
			})
			return
		}

		total := len(tags)
		insertados := 0
		errores := 0

		for i := range tags {
			if err := h.Repo.Upsert(&tags[i]); err != nil {
				errores++
				continue
			}
			insertados++
		}

		utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
			"total":      total,
			"insertados": insertados,
			"errores":    errores,
		})
	}
