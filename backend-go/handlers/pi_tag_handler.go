// handlers/pi_tag_handler.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/services"
	"backend/utils"
)

type PITagHandler struct {
	Repo               *repository.PITagRepository
	Service            *services.PITagService
	TagDescubiertoRepo *repository.TagDescubiertoRepository
}

func NewPITagHandler(
	repo *repository.PITagRepository,
	service *services.PITagService,
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *PITagHandler {
	return &PITagHandler{
		Repo:               repo,
		Service:            service,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
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

// GetTagsAgrupados - GET /api/pi/tags/agrupados
func (h *PITagHandler) GetTagsAgrupados(w http.ResponseWriter, r *http.Request) {
	agrupados, err := h.TagDescubiertoRepo.ObtenerTagsAgrupados()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags agrupados: "+err.Error())
		return
	}
	if agrupados == nil {
		agrupados = []models.TagAgrupado{}
	}
	utils.SuccessJSON(w, http.StatusOK, agrupados)
}

// GetFuentesDisponibles - GET /api/pi/fuentes
func (h *PITagHandler) GetFuentesDisponibles(w http.ResponseWriter, r *http.Request) {
	fuentes, err := h.TagDescubiertoRepo.ObtenerFuentesDisponibles()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo fuentes: "+err.Error())
		return
	}
	if fuentes == nil {
		fuentes = []models.FuenteDisponible{}
	}
	utils.SuccessJSON(w, http.StatusOK, fuentes)
}

func (h *PITagHandler) GetTagsJerarquia(w http.ResponseWriter, r *http.Request) {
	fuente := r.URL.Query().Get("fuente")

	var rows *sql.Rows
	var err error

	if fuente != "" {
		rows, err = h.Repo.DB.Query(`
            SELECT 
                tag_name,
                ruta_completa,
                nivel_jerarquico,
                elemento_padre,
                unidad,
                ultimo_valor
            FROM tags_descubiertos
            WHERE ruta_completa IS NOT NULL AND ruta_completa != ''
              AND pi_server = $1
            ORDER BY ruta_completa, tag_name
        `, fuente)
	} else {
		rows, err = h.Repo.DB.Query(`
            SELECT 
                tag_name,
                ruta_completa,
                nivel_jerarquico,
                elemento_padre,
                unidad,
                ultimo_valor
            FROM tags_descubiertos
            WHERE ruta_completa IS NOT NULL AND ruta_completa != ''
            ORDER BY ruta_completa, tag_name
        `)
	}

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var tags []map[string]interface{}
	for rows.Next() {
		var tagName, rutaCompleta, elementoPadre, unidad string
		var nivelJerarquico int
		var ultimoValor sql.NullFloat64

		err := rows.Scan(&tagName, &rutaCompleta, &nivelJerarquico, &elementoPadre, &unidad, &ultimoValor)
		if err != nil {
			continue
		}

		tag := map[string]interface{}{
			"tag_name":         tagName,
			"ruta_completa":    rutaCompleta,
			"nivel_jerarquico": nivelJerarquico,
			"elemento_padre":   elementoPadre,
			"unidad":           unidad,
		}
		if ultimoValor.Valid {
			tag["ultimo_valor"] = ultimoValor.Float64
		}
		tags = append(tags, tag)
	}

	utils.SuccessJSON(w, http.StatusOK, tags)
}

func (h *PITagHandler) GetEstructuraTags(w http.ResponseWriter, r *http.Request) {
	fuente := r.URL.Query().Get("fuente")

	var rows *sql.Rows
	var err error

	query := `
        SELECT 
            tag_name,
            COALESCE(ruta_completa, CONCAT('7937 - El Porvenir → ', COALESCE(element_name, 'SIN_ELEMENTO'))) as ruta_completa,
            COALESCE(nivel_jerarquico, 2) as nivel_jerarquico,
            COALESCE(elemento_padre, element_name) as elemento_padre,
            COALESCE(unidad, 'N/A') as unidad
        FROM tags_descubiertos
        WHERE element_name IS NOT NULL AND element_name != ''
    `

	if fuente != "" {
		query += " AND pi_server = $1 ORDER BY ruta_completa, tag_name"
		rows, err = h.Repo.DB.Query(query, fuente)
	} else {
		query += " ORDER BY ruta_completa, tag_name"
		rows, err = h.Repo.DB.Query(query)
	}

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var tags []map[string]interface{}
	for rows.Next() {
		var tagName, rutaCompleta, elementoPadre, unidad string
		var nivelJerarquico int

		err := rows.Scan(&tagName, &rutaCompleta, &nivelJerarquico, &elementoPadre, &unidad)
		if err != nil {
			continue
		}

		tag := map[string]interface{}{
			"tag_name":         tagName,
			"ruta_completa":    rutaCompleta,
			"nivel_jerarquico": nivelJerarquico,
			"elemento_padre":   elementoPadre,
			"unidad":           unidad,
		}
		tags = append(tags, tag)
	}

	utils.SuccessJSON(w, http.StatusOK, tags)
}

func (h *PITagHandler) GetTagValor(w http.ResponseWriter, r *http.Request) {
	tag := r.URL.Query().Get("tag")
	fuente := r.URL.Query().Get("fuente")

	if tag == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "tag es requerido")
		return
	}

	var ultimoValor sql.NullFloat64
	var unidad string
	var ultimaActualizacion sql.NullTime

	query := `
        SELECT ultimo_valor, unidad, ultima_actualizacion
        FROM tags_descubiertos
        WHERE tag_name = $1
    `

	var err error
	if fuente != "" {
		query += " AND pi_server = $2"
		err = h.Repo.DB.QueryRow(query, tag, fuente).Scan(&ultimoValor, &unidad, &ultimaActualizacion)
	} else {
		err = h.Repo.DB.QueryRow(query, tag).Scan(&ultimoValor, &unidad, &ultimaActualizacion)
	}

	if err != nil {
		if err == sql.ErrNoRows {
			utils.ErrorJSON(w, http.StatusNotFound, "Tag no encontrado")
			return
		}
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"tag":    tag,
		"unidad": unidad,
	}

	if ultimoValor.Valid {
		response["valor"] = ultimoValor.Float64
	} else {
		response["valor"] = nil
	}

	if ultimaActualizacion.Valid {
		response["actualizado_en"] = ultimaActualizacion.Time
	}

	utils.SuccessJSON(w, http.StatusOK, response)
}
