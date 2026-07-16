// handlers/auditoria_handler.go
package handlers

import (
	"net/http"

	"backend/models"
	"backend/services"
	"backend/utils"
)

type AuditoriaHandler struct {
	service *services.AuditoriaService
}

func NewAuditoriaHandler(service *services.AuditoriaService) *AuditoriaHandler {
	return &AuditoriaHandler{service: service}
}

func (h *AuditoriaHandler) HandleListarAuditoria(w http.ResponseWriter, r *http.Request) {
	registros, err := h.service.ListarAuditoria()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al obtener registros de auditoría")
		return
	}

	if registros == nil {
		registros = []models.Auditoria{}
	}

	utils.SuccessJSON(w, http.StatusOK, registros)
}

func (h *AuditoriaHandler) HandleListarAuditoriaPorTabla(w http.ResponseWriter, r *http.Request) {
	tabla := r.URL.Query().Get("tabla")
	if tabla == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "Parámetro 'tabla' requerido")
		return
	}

	registros, err := h.service.ListarAuditoriaPorTabla(tabla)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al filtrar auditoría")
		return
	}

	if registros == nil {
		registros = []models.Auditoria{}
	}

	utils.SuccessJSON(w, http.StatusOK, registros)
}
