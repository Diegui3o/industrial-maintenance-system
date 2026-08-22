// handlers/pi_tag_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/services"
	"backend/utils"
)

type PITagHandler struct {
	Service *services.PITagService
}

func NewPITagHandler(service *services.PITagService) *PITagHandler {
	return &PITagHandler{Service: service}
}

// GET /api/pi/tags/sin-equipo
func (h *PITagHandler) GetTagsSinEquipo(w http.ResponseWriter, r *http.Request) {
	tags, err := h.Service.GetTagsSinEquipo()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags sin equipo")
		return
	}
	if tags == nil {
		tags = []models.PITagDiscovery{}
	}
	utils.SuccessJSON(w, http.StatusOK, tags)
}

// GET /api/pi/tags/sugerencias
func (h *PITagHandler) GetSugerenciasAgrupacion(w http.ResponseWriter, r *http.Request) {
	sugerencias, err := h.Service.GetSugerenciasAgrupacion()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo sugerencias")
		return
	}
	if sugerencias == nil {
		sugerencias = []models.PITagSugerencia{}
	}
	utils.SuccessJSON(w, http.StatusOK, sugerencias)
}

// POST /api/pi/tags/asignar
func (h *PITagHandler) AsignarTagsEquipo(w http.ResponseWriter, r *http.Request) {
	var asignacion models.PITagAsignacion
	if err := json.NewDecoder(r.Body).Decode(&asignacion); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if asignacion.EquipoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id inválido")
		return
	}

	if len(asignacion.Tags) == 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "no se especificaron tags")
		return
	}

	err := h.Service.AsignarTagsEquipo(asignacion)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":   "Tags asignados correctamente",
		"equipo_id": asignacion.EquipoID,
		"cantidad":  len(asignacion.Tags),
	})
}

// POST /api/pi/tags/crear-equipo
func (h *PITagHandler) CrearEquipoConTags(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Nombre string   `json:"nombre"`
		Codigo string   `json:"codigo"`
		Area   string   `json:"area"`
		Tags   []string `json:"tags"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if data.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre es requerido")
		return
	}

	if len(data.Tags) == 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "se requiere al menos un tag")
		return
	}

	equipoID, err := h.Service.CrearYAsignarTags(
		data.Nombre,
		data.Tags,
		data.Codigo,
		data.Area,
	)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, map[string]interface{}{
		"mensaje":   "Equipo creado y tags asignados",
		"equipo_id": equipoID,
		"cantidad":  len(data.Tags),
	})
}

// GET /api/pi/tags/equipo/{id}
func (h *PITagHandler) GetTagsByEquipo(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()
	idStr := vars.Get("id")
	if idStr == "" {
		// Si no viene ID, usar el de la URL
		idStr = r.URL.Path[len("/api/pi/tags/equipo/"):]
	}

	equipoID, err := strconv.Atoi(idStr)
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	tags, err := h.Service.Repo.GetTagsByEquipo(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags del equipo")
		return
	}

	if len(tags) == 0 {
		utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
			"equipo_id": equipoID,
			"tags":      []string{},
			"total":     0,
		})
		return
	}

	utils.SuccessJSON(w, http.StatusOK, tags[0])
}
