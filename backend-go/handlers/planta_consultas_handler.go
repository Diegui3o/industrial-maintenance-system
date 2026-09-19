package handlers

import (
	"backend/utils"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetEquipoPlantaDetalle(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"equipo_id invalido",
		)
		return
	}

	detalle, err := h.Service.ObtenerEquipoPlantaDetalle(id)
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	utils.SuccessJSON(
		w,
		http.StatusOK,
		detalle,
	)
}
