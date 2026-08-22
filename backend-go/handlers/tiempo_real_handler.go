package handlers

import (
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type TiempoRealHandler struct {
	SensorRepo *repository.SensorRepository
}

func NewTiempoRealHandler(sensorRepo *repository.SensorRepository) *TiempoRealHandler {
	return &TiempoRealHandler{
		SensorRepo: sensorRepo,
	}
}

// GetUltimosValores - Obtiene todos los últimos valores de un equipo
// GET /api/equipos/{id}/tiempo-real
func (h *TiempoRealHandler) GetUltimosValores(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	valores, err := h.SensorRepo.ObtenerTodosUltimosValores(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo valores")
		return
	}

	if valores == nil {
		valores = []models.UltimoValorSensor{}
	}

	utils.SuccessJSON(w, http.StatusOK, valores)
}

// GetUltimoValor - Obtiene el último valor de un tag específico
// GET /api/equipos/{id}/tiempo-real/{parametro}
func (h *TiempoRealHandler) GetUltimoValor(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}
	parametro := vars["parametro"]

	valor, err := h.SensorRepo.ObtenerUltimoValor(id, parametro)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo valor")
		return
	}

	if valor == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "Tag no encontrado")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, valor)
}

// GetHistoricoTag - Obtiene datos históricos de un tag en un rango de tiempo
// GET /api/equipos/{id}/historico/{parametro}?desde=2026-08-01&hasta=2026-08-21
func (h *TiempoRealHandler) GetHistoricoTag(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}
	parametro := vars["parametro"]

	// Obtener fechas de query params
	desdeStr := r.URL.Query().Get("desde")
	hastaStr := r.URL.Query().Get("hasta")

	// Valores por defecto (últimas 24 horas)
	var desde, hasta time.Time
	if desdeStr == "" {
		desde = time.Now().Add(-24 * time.Hour)
	} else {
		desde, err = time.Parse("2006-01-02", desdeStr)
		if err != nil {
			utils.ErrorJSON(w, http.StatusBadRequest, "Formato de fecha inválido (YYYY-MM-DD)")
			return
		}
	}

	if hastaStr == "" {
		hasta = time.Now()
	} else {
		hasta, err = time.Parse("2006-01-02", hastaStr)
		if err != nil {
			utils.ErrorJSON(w, http.StatusBadRequest, "Formato de fecha inválido (YYYY-MM-DD)")
			return
		}
		// Agregar 23:59:59 para incluir todo el día
		hasta = hasta.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	}

	datos, err := h.SensorRepo.ObtenerHistoricoTag(id, parametro, desde, hasta)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo histórico")
		return
	}

	if datos == nil {
		datos = []models.DatoSensor{}
	}

	utils.SuccessJSON(w, http.StatusOK, datos)
}

// GetTagsByEquipo - Obtiene todos los tags disponibles para un equipo
// GET /api/equipos/{id}/tags
func (h *TiempoRealHandler) GetTagsByEquipo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "ID inválido")
		return
	}

	rows, err := h.SensorRepo.DB.Query(`
        SELECT DISTINCT parametro, unidad 
        FROM datos_sensores 
        WHERE equipo_id = $1
        ORDER BY parametro
    `, id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags")
		return
	}
	defer rows.Close()

	var tags []map[string]string
	for rows.Next() {
		var parametro, unidad string
		if err := rows.Scan(&parametro, &unidad); err != nil {
			continue
		}
		tags = append(tags, map[string]string{
			"parametro": parametro,
			"unidad":    unidad,
		})
	}

	if err := rows.Err(); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error iterando resultados")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, tags)
}
