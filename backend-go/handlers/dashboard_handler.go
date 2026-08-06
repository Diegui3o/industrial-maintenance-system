// handlers/dashboard_handler.go
package handlers

import (
	"backend/services"
	"backend/utils"
	"net/http"
)

type DashboardHandler struct {
	Service *services.DashboardService
}

func (h *DashboardHandler) HandleResumen(w http.ResponseWriter, r *http.Request) {
	resumen, err := h.Service.ObtenerResumen()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al obtener resumen")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, resumen)
}
