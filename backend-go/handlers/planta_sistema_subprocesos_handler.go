package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) CrearSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	var item models.SubprocesoSistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(
			w,
			"Datos invâ”œÃ­lidos",
			http.StatusBadRequest,
		)
		return
	}

	if item.SistemaID <= 0 || item.Nombre == "" {
		http.Error(
			w,
			"El sistema y nombre son obligatorios",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err :=
		h.Service.CrearSubprocesoSistema(item)

	if err != nil {
		http.Error(
			w,
			"Error creando subproceso del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) ActualizarSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(
		mux.Vars(r)["id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID invâ”œÃ­lido",
			http.StatusBadRequest,
		)
		return
	}

	var item models.SubprocesoSistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(
			w,
			"Datos invâ”œÃ­lidos",
			http.StatusBadRequest,
		)
		return
	}

	item.ID = id

	resultado, err :=
		h.Service.ActualizarSubprocesoSistema(item)

	if err != nil {
		http.Error(
			w,
			"Error actualizando subproceso del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) ListarEquiposPorSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoSistemaID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de subproceso de sistema invâ”œÃ­lido",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err :=
		h.Service.ListarEquiposPorSubprocesoSistema(
			subprocesoSistemaID,
		)

	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos del subproceso de sistema",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) AsignarEquipoSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoSistemaID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de subproceso de sistema invâ”œÃ­lido",
			http.StatusBadRequest,
		)
		return
	}

	var datos struct {
		EquipoID int `json:"equipo_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&datos); err != nil {
		http.Error(
			w,
			"Datos invâ”œÃ­lidos",
			http.StatusBadRequest,
		)
		return
	}

	if datos.EquipoID <= 0 {
		http.Error(
			w,
			"El equipo es obligatorio",
			http.StatusBadRequest,
		)
		return
	}

	err = h.Service.AsignarEquipoSubprocesoSistema(
		datos.EquipoID,
		subprocesoSistemaID,
	)

	if err != nil {
		http.Error(
			w,
			"Error asignando equipo al subproceso de sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
