// handlers/dispositivo_red_handler.go
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

type DispositivoRedHandler struct {
	Service *services.DispositivoRedService
}

// Crear: POST /api/dispositivos
func (h *DispositivoRedHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var d models.DispositivoRed
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if d.EquipoID == 0 || d.IP == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id e ip son obligatorios")
		return
	}

	if err := h.Service.Crear(&d); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, d)
}

// ListarTodos: GET /api/dispositivos
func (h *DispositivoRedHandler) ListarTodos(w http.ResponseWriter, r *http.Request) {
	dispositivos, err := h.Service.ListarTodos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar dispositivos")
		return
	}
	if dispositivos == nil {
		dispositivos = []models.DispositivoRed{}
	}
	utils.SuccessJSON(w, http.StatusOK, dispositivos)
}

// ListarPorEquipo: GET /api/equipos/{id}/dispositivos
func (h *DispositivoRedHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	dispositivos, err := h.Service.ListarPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar dispositivos")
		return
	}
	if dispositivos == nil {
		dispositivos = []models.DispositivoRed{}
	}
	utils.SuccessJSON(w, http.StatusOK, dispositivos)
}

// ObtenerPorID: GET /api/dispositivos/{id}
func (h *DispositivoRedHandler) ObtenerPorID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	d, err := h.Service.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusNotFound, "Dispositivo no encontrado")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, d)
}

// Actualizar: PUT /api/dispositivos/{id}
func (h *DispositivoRedHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var d models.DispositivoRed
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if err := h.Service.Actualizar(id, &d); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Dispositivo actualizado"})
}

// Eliminar: DELETE /api/dispositivos/{id}
func (h *DispositivoRedHandler) Eliminar(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Service.Eliminar(id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Dispositivo eliminado"})
}
