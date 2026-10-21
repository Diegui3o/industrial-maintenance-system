package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetRepuestos(w http.ResponseWriter, r *http.Request) {
	repuestos, err := h.Service.ListarRepuestos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if repuestos == nil {
		repuestos = []models.Repuesto{}
	}

	utils.SuccessJSON(w, http.StatusOK, repuestos)
}

func (h *EstructuraPlantaHandler) PostRepuesto(w http.ResponseWriter, r *http.Request) {
	var rep models.Repuesto

	if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if strings.TrimSpace(rep.Nombre) == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre no puede estar vacio")
		return
	}

	if err := h.Service.CrearRepuesto(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, rep)
}

func (h *EstructuraPlantaHandler) PutRepuesto(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var rep models.RepuestoActualizacion
	if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if rep.Nombre != nil && strings.TrimSpace(*rep.Nombre) == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre no puede estar vacio")
		return
	}

	if rep.StockActual != nil && *rep.StockActual < 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "stock_actual no puede ser negativo")
		return
	}

	if rep.StockMinimo != nil && *rep.StockMinimo < 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "stock_minimo no puede ser negativo")
		return
	}

	if err := h.Service.ActualizarRepuesto(id, rep); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Repuesto actualizado correctamente",
		"id":      id,
	})
}
