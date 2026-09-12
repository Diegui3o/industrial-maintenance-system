package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarSubprocesosRequest struct {
	SubprocesoIDs []int `json:"subproceso_ids"`
}

// GetTodosSubprocesos devuelve todos los subprocesos activos.
func (h *EstructuraPlantaHandler) GetTodosSubprocesos(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesos, err := h.Service.ListarTodosSubprocesosPlanta()
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if subprocesos == nil {
		subprocesos = make([]models.SubprocesoPlanta, 0)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(subprocesos); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}

// PutRelacionarSubprocesosConProceso asigna varios subprocesos
// existentes a un mismo proceso.
func (h *EstructuraPlantaHandler) PutRelacionarSubprocesosConProceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	procesoID, err := strconv.Atoi(
		mux.Vars(r)["proceso_id"],
	)

	if err != nil || procesoID <= 0 {
		http.Error(
			w,
			"proceso_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	var req relacionarSubprocesosRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			"JSON inválido",
			http.StatusBadRequest,
		)
		return
	}

	if len(req.SubprocesoIDs) == 0 {
		http.Error(
			w,
			"debe seleccionar al menos un subproceso",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.Service.RelacionarSubprocesosConProceso(
		procesoID,
		req.SubprocesoIDs,
	); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}