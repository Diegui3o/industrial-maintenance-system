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

func (h *MantenimientoHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var m models.Mantenimiento
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if err := h.Repo.Crear(&m); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, m)
}

func (h *MantenimientoHandler) Obtener(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	m, err := h.Repo.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusNotFound, "No encontrado")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, m)
}

func (h *MantenimientoHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
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
