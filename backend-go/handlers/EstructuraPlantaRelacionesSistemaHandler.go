package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarSubprocesosSistemaRequest struct {
	SubprocesoIDs []int `json:"subproceso_ids"`
}

func (h *EstructuraPlantaHandler) GetTodosSubprocesosSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesos, err := h.Service.ListarTodosSubprocesosSistemaPlanta()
	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if subprocesos == nil {
		subprocesos = make([]models.SubprocesoSistemaPlanta, 0)
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

func (h *EstructuraPlantaHandler) PutRelacionarSubprocesosConSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	sistemaID, err := strconv.Atoi(
		mux.Vars(r)["sistema_id"],
	)

	if err != nil || sistemaID <= 0 {
		http.Error(
			w,
			"sistema_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	var req relacionarSubprocesosSistemaRequest

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

	if err := h.Service.RelacionarSubprocesosConSistema(
		sistemaID,
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