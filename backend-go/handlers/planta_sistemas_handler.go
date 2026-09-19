package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) GetSistemas(w http.ResponseWriter, r *http.Request) {
	sistemas, err := h.Service.ListarSistemas()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if sistemas == nil {
		sistemas = []models.SistemaPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, sistemas)
}

func (h *EstructuraPlantaHandler) PostSistema(w http.ResponseWriter, r *http.Request) {
	var s models.SistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearSistema(&s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, s)
}

func (h *EstructuraPlantaHandler) PostEquipoSistema(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SistemaID int `json:"sistema_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SistemaID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "sistema_id requerido")
		return
	}

	if err := h.Service.AsignarSistema(
		equipoID,
		req.SistemaID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id":  equipoID,
		"sistema_id": req.SistemaID,
	})
}

// ==================== COMPONENTES ====================

func (h *EstructuraPlantaHandler) PutSistema(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var s models.SistemaPlanta
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarSistema(id, s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Sistema actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutEquipoSistemas(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		Sistemas []int `json:"sistemas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarEquipoSistemas(
		equipoID,
		req.Sistemas,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":   "Sistemas del equipo actualizados correctamente",
		"equipo_id": equipoID,
		"sistemas":  req.Sistemas,
	})
}

func (h *EstructuraPlantaHandler) GetSistemasPorEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	lista, err := h.Service.ListarSistemasPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.SistemaPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) ListarSubprocesosSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	sistemaID, err := strconv.Atoi(
		mux.Vars(r)["sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de sistema invÃ¡lido",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err := h.Service.ListarSubprocesosSistema(
		sistemaID,
	)

	if err != nil {
		http.Error(
			w,
			"Error obteniendo subprocesos del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.SubprocesoSistemaPlanta{}
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(resultado)
}
