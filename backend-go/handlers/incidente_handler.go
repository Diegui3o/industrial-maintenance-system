package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"backend/models"
	"backend/repository"
	"backend/services"

	"github.com/gorilla/mux"
)

type IncidenteHandler struct {
	service *services.IncidenteService
}

func NewIncidenteHandler(
	service *services.IncidenteService,
) *IncidenteHandler {
	return &IncidenteHandler{
		service: service,
	}
}

func (h *IncidenteHandler) List(w http.ResponseWriter, r *http.Request) {

	limit := 200

	if value := r.URL.Query().Get("limit"); value != "" {
		parsed, err := strconv.Atoi(value)

		if err != nil || parsed <= 0 {
			http.Error(w, "limit inválido", http.StatusBadRequest)
			return
		}

		limit = parsed
	}

	ctx := r.Context()

	incidentes, err := h.service.List(ctx, limit)

	if err != nil {
		http.Error(
			w,
			"error obteniendo incidentes: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"data":  incidentes,
		"total": len(incidentes),
	})
}

func (h *IncidenteHandler) Get(w http.ResponseWriter, r *http.Request) {

	id := strings.TrimSpace(mux.Vars(r)["id"])

	incidente, err := h.service.Get(r.Context(), id)

	if err != nil {
		if errors.Is(err, repository.ErrIncidenteNoEncontrado) {
			http.Error(w, "incidente no encontrado", http.StatusNotFound)
			return
		}

		http.Error(
			w,
			"error obteniendo incidente: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	writeJSON(w, http.StatusOK, incidente)
}

func (h *IncidenteHandler) Create(w http.ResponseWriter, r *http.Request) {

	defer r.Body.Close()

	var incidente models.Incidente

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&incidente); err != nil {
		http.Error(
			w,
			"JSON inválido: "+err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	id, err := h.service.Create(
		r.Context(),
		&incidente,
	)

	if err != nil {
		http.Error(
			w,
			"error creando incidente: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	incidente.ID = id

	writeJSON(w, http.StatusCreated, incidente)
}

func (h *IncidenteHandler) Update(w http.ResponseWriter, r *http.Request) {

	defer r.Body.Close()

	id := strings.TrimSpace(mux.Vars(r)["id"])

	var incidente models.Incidente

	decoder := json.NewDecoder(r.Body)

	if err := decoder.Decode(&incidente); err != nil {
		http.Error(
			w,
			"JSON inválido: "+err.Error(),
			http.StatusBadRequest,
		)
		return
	}

	err := h.service.Update(
		r.Context(),
		id,
		&incidente,
	)

	if err != nil {
		if errors.Is(err, repository.ErrIncidenteNoEncontrado) {
			http.Error(w, "incidente no encontrado", http.StatusNotFound)
			return
		}

		http.Error(
			w,
			"error actualizando incidente: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	incidente.ID = id

	writeJSON(w, http.StatusOK, incidente)
}

func (h *IncidenteHandler) Delete(w http.ResponseWriter, r *http.Request) {

	id := strings.TrimSpace(mux.Vars(r)["id"])

	err := h.service.Delete(
		r.Context(),
		id,
	)

	if err != nil {
		if errors.Is(err, repository.ErrIncidenteNoEncontrado) {
			http.Error(w, "incidente no encontrado", http.StatusNotFound)
			return
		}

		http.Error(
			w,
			"error eliminando incidente: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(
	w http.ResponseWriter,
	status int,
	value interface{},
) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(value); err != nil {
		return
	}
}
