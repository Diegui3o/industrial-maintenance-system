package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type MantenimientoHandler struct {
	Repo *repository.MantenimientoRepository
}

func NewMantenimientoHandler(repo *repository.MantenimientoRepository) *MantenimientoHandler {
	return &MantenimientoHandler{Repo: repo}
}

func (h *MantenimientoHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var m models.Mantenimiento

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	id, err := h.Repo.Crear(&m)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	m.ID = id
	utils.SuccessJSON(w, http.StatusCreated, m)
}

func (h *MantenimientoHandler) Obtener(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	m, err := h.Repo.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if m == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "mantenimiento no encontrado")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, m)
}

func (h *MantenimientoHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.Mantenimiento{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *MantenimientoHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var m models.Mantenimiento

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if err := h.Repo.Actualizar(id, m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{
		"mensaje": "Mantenimiento actualizado correctamente",
	})
}

// Compatibilidad con las rutas actuales
func (h *MantenimientoHandler) GetPorEquipo(w http.ResponseWriter, r *http.Request) {
	h.ListarPorEquipo(w, r)
}

func (h *MantenimientoHandler) GetPorID(w http.ResponseWriter, r *http.Request) {
	h.Obtener(w, r)
}

func (h *MantenimientoHandler) Update(w http.ResponseWriter, r *http.Request) {
	h.Actualizar(w, r)
}