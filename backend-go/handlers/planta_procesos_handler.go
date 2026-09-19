package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetProcesos(w http.ResponseWriter, r *http.Request) {
	procesos, err := h.Service.ListarProcesos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if procesos == nil {
		procesos = []models.ProcesoPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, procesos)
}

func (h *EstructuraPlantaHandler) PostProceso(w http.ResponseWriter, r *http.Request) {
	var p models.ProcesoPlanta

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if p.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearProceso(&p); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, p)
}

// ==================== SUBPROCESOS ====================

func (h *EstructuraPlantaHandler) PutProceso(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var p models.ProcesoPlanta
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if p.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarProceso(id, p); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Proceso actualizado correctamente",
		"id":      id,
	})
}
