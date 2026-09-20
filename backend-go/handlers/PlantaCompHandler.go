package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

type relacionarComponenteRequest struct {
	ComponenteID int  `json:"componente_id"`
	EquipoID     *int `json:"equipo_id"`
}

type relacionarComponentesRequest struct {
	Relaciones []relacionarComponenteRequest `json:"relaciones"`
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

	relaciones := make([]models.RelacionComponente, 0, len(req.Relaciones))

	for _, item := range req.Relaciones {
		relaciones = append(
			relaciones,
			models.RelacionComponente{
				ComponenteID: item.ComponenteID,
				EquipoID:     item.EquipoID,
			},
		)
	}

	if err := h.Service.RelacionarComponentesConEquipo(
		equipoID,
		relaciones,
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
