package handlers

import (
	"encoding/json"
	"net/http"

	"backend/models"
)

func (h *EstructuraPlantaHandler) GetMaestrosMotoresElectricos(
	w http.ResponseWriter,
	r *http.Request,
) {
	motores, err := h.Service.ListarMaestrosMotoresElectricos()

	if err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	if motores == nil {
		motores = make([]models.MaestroMotorElectrico, 0)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(motores); err != nil {
		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)
	}
}