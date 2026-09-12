package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarEquiposSubprocesoRequest struct {
	EquipoIDs []int `json:"equipo_ids"`
}

func (h *EstructuraPlantaHandler) GetEquiposParaRelacionSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_id"],
	)

	if err != nil || subprocesoID <= 0 {
		http.Error(
			w,
			"subproceso_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	equipos, err :=
		h.Service.ListarEquiposParaRelacionSubproceso(
			subprocesoID,
		)

	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if equipos == nil {
		equipos = make([]models.Equipo, 0)
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	if err := json.NewEncoder(w).Encode(equipos); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}

func (h *EstructuraPlantaHandler) PutRelacionarEquiposConSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_id"],
	)

	if err != nil || subprocesoID <= 0 {
		http.Error(
			w,
			"subproceso_id inválido",
			http.StatusBadRequest,
		)
		return
	}

	var req relacionarEquiposSubprocesoRequest

	if err := json.NewDecoder(
		r.Body,
	).Decode(&req); err != nil {
		http.Error(
			w,
			"JSON inválido",
			http.StatusBadRequest,
		)
		return
	}

	if len(req.EquipoIDs) == 0 {
		http.Error(
			w,
			"debe seleccionar al menos un equipo",
			http.StatusBadRequest,
		)
		return
	}

	if err := h.Service.RelacionarEquiposConSubproceso(
		subprocesoID,
		req.EquipoIDs,
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