// handlers/usuario_handler.go
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

type UsuarioHandler struct {
	Service *services.UsuarioService
}

func (h *UsuarioHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var u models.Usuario
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if u.Nombre == "" || u.Username == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "Nombre y username son obligatorios")
		return
	}
	if err := h.Service.Crear(&u); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusCreated, u)
}

func (h *UsuarioHandler) Listar(w http.ResponseWriter, r *http.Request) {
	usuarios, err := h.Service.Listar()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar usuarios")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, usuarios)
}

func (h *UsuarioHandler) ObtenerPorID(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	u, err := h.Service.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusNotFound, "Usuario no encontrado")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, u)
}
