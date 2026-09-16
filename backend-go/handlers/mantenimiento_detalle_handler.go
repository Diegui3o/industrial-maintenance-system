package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type MantenimientoDetalleHandler struct {
	Repo *repository.MantenimientoDetalleRepository
}

func NewMantenimientoDetalleHandler(
	repo *repository.MantenimientoDetalleRepository,
) *MantenimientoDetalleHandler {
	return &MantenimientoDetalleHandler{Repo: repo}
}

// ============================================================
// ACTIVIDADES
// ============================================================

func (h *MantenimientoDetalleHandler) CrearActividad(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoActividad

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.Descripcion == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "descripcion requerida")
		return
	}

	if data.Estado == "" {
		data.Estado = "pendiente"
	}

	nuevoID, err := h.Repo.CrearActividad(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoDetalleHandler) ListarActividades(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarActividades(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoActividad{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// AVANCES
// ============================================================

func (h *MantenimientoDetalleHandler) CrearAvance(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoAvance

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.Porcentaje < 0 || data.Porcentaje > 100 {
		utils.ErrorJSON(w, http.StatusBadRequest, "porcentaje invalido")
		return
	}

	nuevoID, err := h.Repo.CrearAvance(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoDetalleHandler) ListarAvances(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarAvances(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoAvance{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// PERSONAL
// ============================================================

func (h *MantenimientoDetalleHandler) CrearPersonal(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoPersonal

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	nuevoID, err := h.Repo.CrearPersonal(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoDetalleHandler) ListarPersonal(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarPersonal(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoPersonal{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// HISTORIAL
// ============================================================

func (h *MantenimientoDetalleHandler) CrearHistorial(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoHistorial

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.TipoEvento == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "tipo_evento requerido")
		return
	}

	nuevoID, err := h.Repo.CrearHistorial(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoDetalleHandler) ListarHistorial(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarHistorial(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoHistorial{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// UTIL
// ============================================================

func mantenimientoID(r *http.Request) (int, error) {
	return strconv.Atoi(mux.Vars(r)["id"])
}
func (h *MantenimientoDetalleHandler) ActualizarActividad(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoActividad

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarActividad(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Actividad actualizada correctamente",
	})
}

func (h *MantenimientoDetalleHandler) ActualizarAvance(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoAvance

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarAvance(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Avance actualizado correctamente",
	})
}

func (h *MantenimientoDetalleHandler) ActualizarPersonal(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoPersonal

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarPersonal(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Personal actualizado correctamente",
	})
}
func (h *MantenimientoDetalleHandler) EliminarActividad(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarActividad(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MantenimientoDetalleHandler) EliminarAvance(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarAvance(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MantenimientoDetalleHandler) EliminarPersonal(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarPersonal(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
