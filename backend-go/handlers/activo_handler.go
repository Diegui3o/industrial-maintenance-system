package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type ActivoHandler struct {
	Service *services.ActivoService
}

func NewActivoHandler(svc *services.ActivoService) *ActivoHandler {
	return &ActivoHandler{Service: svc}
}

// PUT /api/activos/{tipo}/{id}/estado
// Body: {"estado": "mantenimiento"} o {"estado": "activo"}
func (h *ActivoHandler) CambiarEstado(w http.ResponseWriter, r *http.Request) {
	tipo := mux.Vars(r)["tipo"]
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ErrorJSON(w, 400, "id inválido")
		return
	}

	var body struct {
		Estado string `json:"estado"`
		Motivo string `json:"motivo,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, 400, "JSON inválido: "+err.Error())
		return
	}

	if body.Estado == "" {
		utils.ErrorJSON(w, 400, "campo 'estado' es obligatorio")
		return
	}

	if err := h.Service.CambiarEstadoActivo(tipo, id, body.Estado, body.Motivo); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	utils.SuccessJSON(w, 200, map[string]interface{}{
		"mensaje": "Estado actualizado",
		"tipo":    tipo,
		"id":      id,
		"estado":  body.Estado,
	})
}

// GET /api/activos/{tipo}/{id}/estado
func (h *ActivoHandler) ObtenerEstado(w http.ResponseWriter, r *http.Request) {
	tipo := mux.Vars(r)["tipo"]
	idStr := mux.Vars(r)["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.ErrorJSON(w, 400, "id inválido")
		return
	}

	estado, err := h.Service.EquipoRepo.ObtenerEstadoActivo(tipo, id)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if estado == "" {
		utils.ErrorJSON(w, 404, "activo no encontrado")
		return
	}

	utils.SuccessJSON(w, 200, map[string]interface{}{
		"tipo":   tipo,
		"id":     id,
		"estado": estado,
	})
}