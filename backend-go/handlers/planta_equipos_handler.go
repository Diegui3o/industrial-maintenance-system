package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) PostEquipoSubproceso(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SubprocesoID int `json:"subproceso_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SubprocesoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id requerido")
		return
	}

	if err := h.Service.AsignarEquipoSubproceso(
		equipoID,
		req.SubprocesoID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id":     equipoID,
		"subproceso_id": req.SubprocesoID,
	})
}

func (h *EstructuraPlantaHandler) GetEquipoSubproceso(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	resultado, err := h.Service.ObtenerSubprocesoEquipo(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusNotFound, "equipo sin subproceso asignado")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, resultado)
}

// ==================== CLASIFICACIONES ====================

func (h *EstructuraPlantaHandler) PutEquipoSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SubprocesoID int `json:"subproceso_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SubprocesoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id requerido")
		return
	}

	err = h.Service.ActualizarEquipoSubproceso(
		equipoID,
		req.SubprocesoID,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":       "Subproceso del equipo actualizado correctamente",
		"equipo_id":     equipoID,
		"subproceso_id": req.SubprocesoID,
	})
}

func (h *EstructuraPlantaHandler) GetEquiposPorSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["subproceso_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id invalido")
		return
	}

	lista, err := h.Service.ListarEquiposPorSubproceso(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.PlantaEquipo{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) ListarEquiposSinUbicar(w http.ResponseWriter, r *http.Request) {
	equipos, err := h.Service.ListarEquiposSinUbicar()
	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos sin ubicar",
			http.StatusInternalServerError,
		)
		return
	}

	if equipos == nil {
		equipos = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(equipos)
}

func (h *EstructuraPlantaHandler) ListarEquiposDisponiblesSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipos, err := h.Service.ListarEquiposDisponiblesSistema()

	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos disponibles para sistemas",
			http.StatusInternalServerError,
		)
		return
	}

	if equipos == nil {
		equipos = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(equipos)
}
