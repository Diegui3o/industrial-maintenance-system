package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarSubcomponentesRequest struct {
	SubcomponenteIDs []int `json:"subcomponente_ids"`
}

func (h *EstructuraPlantaHandler) GetSubcomponentesParaRelacion(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(
		mux.Vars(r)["componente_id"],
	)

	if err != nil || componenteID <= 0 {
		http.Error(
			w,
			"componente_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	items, err :=
		h.Service.ListarSubcomponentesParaRelacion(componenteID)

	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if items == nil {
		items = make([]models.SubcomponenteEquipo, 0)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(items); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}

func (h *EstructuraPlantaHandler) PutRelacionarSubcomponentes(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(
		mux.Vars(r)["componente_id"],
	)

	if err != nil || componenteID <= 0 {
		http.Error(
			w,
			"componente_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	var req relacionarSubcomponentesRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			"JSON inválido",
			http.StatusBadRequest,
		)
		return
	}

	if len(req.SubcomponenteIDs) == 0 {
		http.Error(
			w,
			"debe seleccionar al menos un subcomponente",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.Service.RelacionarSubcomponentes(
		componenteID,
		req.SubcomponenteIDs,
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