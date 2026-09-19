package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetClasificaciones(w http.ResponseWriter, r *http.Request) {
	clasificaciones, err := h.Service.ListarClasificaciones()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if clasificaciones == nil {
		clasificaciones = []models.ClasificacionPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, clasificaciones)
}

func (h *EstructuraPlantaHandler) PostClasificacion(w http.ResponseWriter, r *http.Request) {
	var c models.ClasificacionPlanta

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearClasificacion(&c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, c)
}

func (h *EstructuraPlantaHandler) PostEquipoClasificacion(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		ClasificacionID int `json:"clasificacion_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.ClasificacionID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "clasificacion_id requerido")
		return
	}

	if err := h.Service.AsignarClasificacion(
		equipoID,
		req.ClasificacionID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id":        equipoID,
		"clasificacion_id": req.ClasificacionID,
	})
}

// ==================== SISTEMAS ====================

func (h *EstructuraPlantaHandler) PutClasificacion(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var c models.ClasificacionPlanta
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarClasificacion(id, c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Clasificacion actualizada correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutEquipoClasificaciones(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		Clasificaciones []int `json:"clasificaciones"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarEquipoClasificaciones(
		equipoID,
		req.Clasificaciones,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":         "Clasificaciones del equipo actualizadas correctamente",
		"equipo_id":       equipoID,
		"clasificaciones": req.Clasificaciones,
	})
}

func (h *EstructuraPlantaHandler) GetClasificacionesPorEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	lista, err := h.Service.ListarClasificacionesPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.ClasificacionPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}
