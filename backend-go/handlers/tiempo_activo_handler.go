package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type TiempoActivoHandler struct {
	Service *services.TiempoActivoService
}

func NewTiempoActivoHandler(svc *services.TiempoActivoService) *TiempoActivoHandler {
	return &TiempoActivoHandler{Service: svc}
}

// GET /api/tiempos/{tagID}/guardias?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
func (h *TiempoActivoHandler) Guardias(w http.ResponseWriter, r *http.Request) {
	tagID, _ := strconv.Atoi(mux.Vars(r)["id"])
	if tagID <= 0 {
		utils.ErrorJSON(w, 400, "tagID inválido")
		return
	}

	desde, hasta, err := parseRango(r)
	if err != nil {
		utils.ErrorJSON(w, 400, err.Error())
		return
	}

	guardias, err := h.Service.ResumenPorGuardia(tagID, desde, hasta)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if guardias == nil {
		guardias = []models.ResumenGuardia{}
	}
	utils.SuccessJSON(w, 200, guardias)
}

// GET /api/tiempos/{tagID}/dias?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
func (h *TiempoActivoHandler) Dias(w http.ResponseWriter, r *http.Request) {
	tagID, _ := strconv.Atoi(mux.Vars(r)["id"])
	if tagID <= 0 {
		utils.ErrorJSON(w, 400, "tagID inválido")
		return
	}

	desde, hasta, err := parseRango(r)
	if err != nil {
		utils.ErrorJSON(w, 400, err.Error())
		return
	}

	dias, err := h.Service.ResumenPorDia(tagID, desde, hasta)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if dias == nil {
		dias = []models.ResumenDia{}
	}
	utils.SuccessJSON(w, 200, dias)
}

func parseRango(r *http.Request) (time.Time, time.Time, error) {
	loc, err := time.LoadLocation("America/Lima")
	if err != nil {
		loc = time.FixedZone("PET", -5*3600)
	}

	q := r.URL.Query()
	desdeStr := q.Get("desde")
	hastaStr := q.Get("hasta")

	// Hoy en hora local
	ahoraLocal := time.Now().In(loc)

	if desdeStr == "" {
		desdeStr = ahoraLocal.Format("2006-01-02")
	}
	if hastaStr == "" {
		hastaStr = desdeStr
	}

	desdeLocal, err := time.ParseInLocation("2006-01-02", desdeStr, loc)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("desde inválido: %w", err)
	}
	hastaLocal, err := time.ParseInLocation("2006-01-02", hastaStr, loc)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("hasta inválido: %w", err)
	}

	// Día operativo: desde las 07:00 del día indicado
	// hasta las 07:00 del día siguiente al último solicitado
	desde := desdeLocal.Add(7 * time.Hour)
	hasta := hastaLocal.Add(7 * time.Hour).Add(24 * time.Hour)

	if hasta.Before(desde) {
		return time.Time{}, time.Time{}, fmt.Errorf("hasta debe ser >= desde")
	}

	// Convertir a UTC
	return desde.UTC(), hasta.UTC(), nil
}