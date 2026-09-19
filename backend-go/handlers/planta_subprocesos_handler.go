package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetSubprocesos(w http.ResponseWriter, r *http.Request) {
	procesoID, err := strconv.Atoi(mux.Vars(r)["proceso_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id invalido")
		return
	}

	subprocesos, err := h.Service.ListarSubprocesos(procesoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if subprocesos == nil {
		subprocesos = []models.SubprocesoPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, subprocesos)
}

func (h *EstructuraPlantaHandler) PostSubproceso(w http.ResponseWriter, r *http.Request) {
	var s models.SubprocesoPlanta

	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.ProcesoID <= 0 || s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id y nombre son requeridos")
		return
	}

	if err := h.Service.CrearSubproceso(&s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, s)
}

// ==================== EQUIPO â†’ SUBPROCESO ====================

func (h *EstructuraPlantaHandler) PutSubproceso(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var s models.SubprocesoPlanta
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.ProcesoID <= 0 || s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id y nombre son requeridos")
		return
	}

	if err := h.Service.ActualizarSubproceso(id, s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Subproceso actualizado correctamente",
		"id":      id,
	})
}
