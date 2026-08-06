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

type ConexionHandler struct {
	Repo *repository.ConexionRepository
}

func (h *ConexionHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	conexiones, err := h.Repo.ListarPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if conexiones == nil {
		conexiones = []models.Conexion{}
	}
	utils.SuccessJSON(w, 200, conexiones)
}

func (h *ConexionHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var c models.Conexion
	json.NewDecoder(r.Body).Decode(&c)
	if err := h.Repo.Crear(&c); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 201, c)
}

func (h *ConexionHandler) Eliminar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["conId"])
	if err := h.Repo.Eliminar(id); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Conexión eliminada"})
}