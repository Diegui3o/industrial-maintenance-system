package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/models"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
	"github.com/xuri/excelize/v2"
)

type ParadaHandler struct {
	Service *services.ParadaService
}

func NewParadaHandler(svc *services.ParadaService) *ParadaHandler {
	return &ParadaHandler{Service: svc}
}

// GET /api/paradas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&equipo_id=N
func (h *ParadaHandler) Listar(w http.ResponseWriter, r *http.Request) {
	desde, hasta, err := parseRangoParadas(r)
	if err != nil {
		utils.ErrorJSON(w, 400, err.Error())
		return
	}

	var equipoID *int
	if eq := r.URL.Query().Get("equipo_id"); eq != "" {
		if n, err := strconv.Atoi(eq); err == nil && n > 0 {
			equipoID = &n
		}
	}

	paradas, err := h.Service.ListarParadas(desde, hasta, equipoID)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if paradas == nil {
		paradas = []models.Parada{}
	}
	utils.SuccessJSON(w, 200, paradas)
}

// PUT /api/paradas/{id}/responsable
// Body: { personal_responsable, area_responsable, motivo }
func (h *ParadaHandler) ActualizarResponsable(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil || id <= 0 {
		utils.ErrorJSON(w, 400, "id inválido")
		return
	}

	var body models.ActualizarResponsableRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, 400, "JSON inválido: "+err.Error())
		return
	}

	if err := h.Service.ActualizarResponsable(id, body.PersonalResponsable, body.AreaResponsable, body.Motivo); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Responsable actualizado"})
}

// GET /api/paradas/export?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
// Descarga un archivo .xlsx con las 10 columnas del reporte.
func (h *ParadaHandler) Exportar(w http.ResponseWriter, r *http.Request) {
	desde, hasta, err := parseRangoParadas(r)
	if err != nil {
		utils.ErrorJSON(w, 400, err.Error())
		return
	}

	var equipoID *int
	if eq := r.URL.Query().Get("equipo_id"); eq != "" {
		if n, err := strconv.Atoi(eq); err == nil && n > 0 {
			equipoID = &n
		}
	}

	paradas, err := h.Service.ListarParadas(desde, hasta, equipoID)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	f := excelize.NewFile()
	defer f.Close()

	sheet := "Paradas"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{
		"Día", "Hora inicio", "Hora fin", "Tiempo total",
		"Equipo", "Proceso/Subproceso", "Componente/Repuesto/Tag",
		"Personal responsable", "Área responsable", "Motivo",
	}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	// Estilo de encabezado (negrita)
	style, _ := f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true}})
	f.SetCellStyle(sheet, "A1", "J1", style)

	for rowIdx, p := range paradas {
		row := rowIdx + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), p.Inicio.Format("2006-01-02"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), p.Inicio.Format("15:04"))
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), p.Fin.Format("15:04"))
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), fmt.Sprintf("%d min", p.DuracionMinutos))
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), p.EquipoNombre)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), fmt.Sprintf("%s / %s", p.ProcesoNombre, p.SubprocesoNombre))
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), fmt.Sprintf("%s / %s / %s", p.ComponenteNombre, p.RepuestoNombre, p.TagNombre))
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), p.PersonalResponsable)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), p.AreaResponsable)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), p.Motivo)
	}

	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", `attachment; filename="paradas.xlsx"`)
	if err := f.Write(w); err != nil {
		http.Error(w, err.Error(), 500)
	}
}

// parseRangoParadas interpreta desde/hasta como días calendario.
func parseRangoParadas(r *http.Request) (time.Time, time.Time, error) {
	q := r.URL.Query()
	desdeStr := q.Get("desde")
	hastaStr := q.Get("hasta")

	loc, _ := time.LoadLocation("America/Lima")
	if loc == nil {
		loc = time.FixedZone("PET", -5*3600)
	}

	if desdeStr == "" {
		desdeStr = time.Now().In(loc).Format("2006-01-02")
	}
	if hastaStr == "" {
		hastaStr = desdeStr
	}

	desde, err := time.ParseInLocation("2006-01-02", desdeStr, loc)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("desde inválido: %w", err)
	}
	hasta, err := time.ParseInLocation("2006-01-02", hastaStr, loc)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("hasta inválido: %w", err)
	}
	hasta = hasta.Add(24 * time.Hour)

	return desde.UTC(), hasta.UTC(), nil
}
