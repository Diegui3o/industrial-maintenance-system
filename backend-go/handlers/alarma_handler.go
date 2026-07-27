// handlers/alarma_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type AlarmaHandler struct {
	Service *services.AlarmaService
}

func (h *AlarmaHandler) CrearAlarma(w http.ResponseWriter, r *http.Request) {
	var a models.Alarma
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if a.EquipoID == 0 || a.Severidad == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id y severidad son obligatorios")
		return
	}

	if err := h.Service.CrearAlarma(&a); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, a)
}

func (h *AlarmaHandler) ListarActivas(w http.ResponseWriter, r *http.Request) {
	alarmas, err := h.Service.ListarActivas()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar alarmas")
		return
	}
	if alarmas == nil {
		alarmas = []models.Alarma{}
	}
	utils.SuccessJSON(w, http.StatusOK, alarmas)
}

func (h *AlarmaHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	alarmas, err := h.Service.ListarPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar alarmas del equipo")
		return
	}
	if alarmas == nil {
		alarmas = []models.Alarma{}
	}
	utils.SuccessJSON(w, http.StatusOK, alarmas)
}

func (h *AlarmaHandler) Atender(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Service.AtenderAlarma(id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Alarma atendida"})
}

func (h *AlarmaHandler) Cerrar(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Service.CerrarAlarma(id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Alarma cerrada"})
}
