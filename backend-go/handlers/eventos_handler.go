package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type CambioEstadoRequest struct {
	Estado string `json:"estado"`

	Motivo string `json:"motivo"`
}

type EventosHandler struct {
	Service *services.EventosService
}

func (h *EventosHandler) CambiarEstado(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)

	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, "id invalido", http.StatusBadRequest)
		return
	}

	var body CambioEstadoRequest

	err = json.NewDecoder(r.Body).Decode(&body)

	if err != nil {
		http.Error(w, "body invalido", http.StatusBadRequest)
		return
	}

	if body.Estado == "" {

		http.Error(
			w,
			"estado es requerido",
			http.StatusBadRequest,
		)

		return
	}

	estadosValidos := map[string]bool{
		"activo":        true,
		"inactivo":      true,
		"fallo":         true,
		"mantenimiento": true,
	}

	if !estadosValidos[body.Estado] {

		http.Error(
			w,
			"estado no valido",
			http.StatusBadRequest,
		)

		return
	}

	if body.Estado == "fallo" && body.Motivo == "" {

		http.Error(
			w,
			"el motivo es obligatorio cuando el estado es fallo",
			http.StatusBadRequest,
		)

		return
	}

	h.Service.CambiarEstadoEquipo(
		id,
		body.Estado,
		body.Motivo,
	)

	err = h.Service.CambiarEstadoEquipo(
		id,
		body.Estado,
		body.Motivo,
	)

	if err != nil {

		http.Error(
			w,
			err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"mensaje": "Estado actualizado correctamente",
	})
}

func (h *EventosHandler) GetHistorialEquipo(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		http.Error(w, "id invalido", 400)
		return
	}

	lista, err := h.Service.ObtenerHistorialEquipo(id)

	if err != nil {
		utils.ErrorJSON(
			w, 500, "error en obtener historial de equipo",
		)
		return
	}

	json.NewEncoder(w).Encode(lista)
}
