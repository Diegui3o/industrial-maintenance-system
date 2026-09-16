package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type MantenimientoOperacionHandler struct {
	Repo *repository.MantenimientoOperacionRepository
}

func NewMantenimientoOperacionHandler(
	repo *repository.MantenimientoOperacionRepository,
) *MantenimientoOperacionHandler {
	return &MantenimientoOperacionHandler{Repo: repo}
}

// ============================================================
// PROGRAMACIÓN
// ============================================================

func (h *MantenimientoOperacionHandler) CrearProgramacion(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoProgramacion

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.TipoProgramacion == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "tipo_programacion requerido")
		return
	}

	if data.FechaProgramada == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "fecha_programada requerida")
		return
	}

	nuevoID, err := h.Repo.CrearProgramacion(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoOperacionHandler) ListarProgramacion(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarProgramacion(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoProgramacion{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// EJECUCIÓN
// ============================================================

func (h *MantenimientoOperacionHandler) CrearEjecucion(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoEjecucion

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	nuevoID, err := h.Repo.CrearEjecucion(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoOperacionHandler) ListarEjecuciones(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarEjecuciones(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoEjecucion{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// MATERIALES
// ============================================================

func (h *MantenimientoOperacionHandler) CrearMaterial(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoMaterial

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.Cantidad <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "cantidad invalida")
		return
	}

	nuevoID, err := h.Repo.CrearMaterial(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoOperacionHandler) ListarMateriales(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarMateriales(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoMaterial{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

// ============================================================
// PARADAS
// ============================================================

func (h *MantenimientoOperacionHandler) CrearParada(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var data repository.MantenimientoParada

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if data.Nivel == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nivel requerido")
		return
	}

	nuevoID, err := h.Repo.CrearParada(id, data)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	data.ID = nuevoID
	data.MantenimientoID = id

	utils.SuccessJSON(w, http.StatusCreated, data)
}

func (h *MantenimientoOperacionHandler) ListarParadas(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := mantenimientoID(r)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarParadas(id)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []repository.MantenimientoParada{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}
func (h *MantenimientoOperacionHandler) ActualizarProgramacion(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoProgramacion

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarProgramacion(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Programacion actualizada correctamente",
	})
}

func (h *MantenimientoOperacionHandler) ActualizarEjecucion(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoEjecucion

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarEjecucion(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Ejecucion actualizada correctamente",
	})
}

func (h *MantenimientoOperacionHandler) ActualizarMaterial(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoMaterial

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarMaterial(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Material actualizado correctamente",
	})
}

func (h *MantenimientoOperacionHandler) ActualizarParada(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m repository.MantenimientoParada

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.ActualizarParada(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Parada actualizada correctamente",
	})
}
func (h *MantenimientoOperacionHandler) EliminarProgramacion(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarProgramacion(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MantenimientoOperacionHandler) EliminarEjecucion(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarEjecucion(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MantenimientoOperacionHandler) EliminarMaterial(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarMaterial(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MantenimientoOperacionHandler) EliminarParada(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := h.Repo.EliminarParada(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
