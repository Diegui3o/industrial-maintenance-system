package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarComponentesRequest struct {
	ComponenteIDs []int `json:"componente_ids"`
}

func (h *EstructuraPlantaHandler) GetComponentesParaRelacionEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(
		mux.Vars(r)["equipo_id"],
	)

	if err != nil || equipoID <= 0 {
		http.Error(
			w,
			"equipo_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	componentes, err :=
		h.Service.ListarComponentesParaRelacionEquipo(equipoID)

	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if componentes == nil {
		componentes = make([]models.ComponenteEquipo, 0)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(componentes); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}

func (h *EstructuraPlantaHandler) PutRelacionarComponentesConEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(
		mux.Vars(r)["equipo_id"],
	)

	if err != nil || equipoID <= 0 {
		http.Error(
			w,
			"equipo_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	var req relacionarComponentesRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			"JSON inválido",
			http.StatusBadRequest,
		)
		return
	}

	if len(req.ComponenteIDs) == 0 {
		http.Error(
			w,
			"debe seleccionar al menos un componente",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.Service.RelacionarComponentesConEquipo(
		equipoID,
		req.ComponenteIDs,
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