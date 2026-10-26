package handlers

import (
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type AlertaHandler struct {
	Repo *repository.AlertaRepository
}

func NewAlertaHandler(repo *repository.AlertaRepository) *AlertaHandler {
	return &AlertaHandler{Repo: repo}
}

// GET /api/alertas
func (h *AlertaHandler) ListarActivas(w http.ResponseWriter, r *http.Request) {
	alertas, err := h.Repo.ListarActivas()
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if alertas == nil {
		alertas = []models.Alerta{}
	}
	utils.SuccessJSON(w, 200, alertas)
}

// PUT /api/alertas/{id}/descartar
func (h *AlertaHandler) Descartar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil || id <= 0 {
		utils.ErrorJSON(w, 400, "id inválido")
		return
	}

	_, err = h.Repo.DB.Exec(
		`UPDATE alertas SET estado='descartada', fecha_vista=NOW() WHERE id=$1 AND estado='activa'`,
		id,
	)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Alerta descartada"})
}

// PUT /api/alertas/{id}/ver
func (h *AlertaHandler) MarcarVista(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil || id <= 0 {
		utils.ErrorJSON(w, 400, "id inválido")
		return
	}

	_, err = h.Repo.DB.Exec(
		`UPDATE alertas SET estado='vista', fecha_vista=NOW() WHERE id=$1 AND estado='activa'`,
		id,
	)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Alerta marcada como vista"})
}
