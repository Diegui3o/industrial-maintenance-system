package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetComponentes(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	componentes, err := h.Service.ListarComponentes(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if componentes == nil {
		componentes = []models.ComponenteEquipo{}
	}

	utils.SuccessJSON(w, http.StatusOK, componentes)
}

func (h *EstructuraPlantaHandler) PostComponente(w http.ResponseWriter, r *http.Request) {
	var c models.ComponenteEquipo

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if c.EquipoID != nil && *c.EquipoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	if err := h.Service.CrearComponente(&c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, c)
}

// ==================== REPUESTOS ====================

func (h *EstructuraPlantaHandler) PutComponente(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var c models.ComponenteEquipo
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarComponente(id, c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Componente actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) GetRepuestosPorComponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	lista, err := h.Service.ListarRepuestosPorComponente(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.Repuesto{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) GetRepuestosDetallePorComponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"componente_id invalido",
		)
		return
	}

	lista, err := h.Service.ListarRepuestosDetallePorComponente(id)
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	if lista == nil {
		lista = []models.ComponenteRepuestoDetalle{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) PostComponenteRepuesto(w http.ResponseWriter, r *http.Request) {
	componenteID, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	var req struct {
		RepuestoID int     `json:"repuesto_id"`
		Cantidad   float64 `json:"cantidad"`
		Posicion   *string `json:"posicion"`
		Notas      *string `json:"notas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.RepuestoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "repuesto_id requerido")
		return
	}

	if req.Cantidad <= 0 {
		req.Cantidad = 1
	}

	if err := h.Service.AsignarRepuestoComponente(
		componenteID,
		req.RepuestoID,
		req.Cantidad,
		req.Posicion,
		req.Notas,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"componente_id": componenteID,
		"repuesto_id":   req.RepuestoID,
		"cantidad":      req.Cantidad,
	})
}

// ==================== ACTUALIZAR ====================

func (h *EstructuraPlantaHandler) PutComponenteRepuesto(
	w http.ResponseWriter,
	r *http.Request,
) {
	vars := mux.Vars(r)

	componenteID, err := strconv.Atoi(vars["componente_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"componente_id invalido",
		)
		return
	}

	repuestoID, err := strconv.Atoi(vars["repuesto_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"repuesto_id invalido",
		)
		return
	}

	var req struct {
		Cantidad float64 `json:"cantidad"`
		Posicion *string `json:"posicion"`
		Notas    *string `json:"notas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"JSON invalido",
		)
		return
	}

	if req.Cantidad <= 0 {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"cantidad debe ser mayor que cero",
		)
		return
	}

	err = h.Service.ActualizarComponenteRepuesto(
		componenteID,
		repuestoID,
		req.Cantidad,
		req.Posicion,
		req.Notas,
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":       "Repuesto del componente actualizado correctamente",
		"componente_id": componenteID,
		"repuesto_id":   repuestoID,
	})
}

func (h *EstructuraPlantaHandler) PutComponenteRepuestos(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	var req struct {
		Repuestos []int `json:"repuestos"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarComponenteRepuestos(
		componenteID,
		req.Repuestos,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":       "Repuestos del componente actualizados correctamente",
		"componente_id": componenteID,
		"repuestos":     req.Repuestos,
	})
}

// ==================== CONSULTAR RELACIONES ====================
