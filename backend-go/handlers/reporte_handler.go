package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/repository"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
	"github.com/xuri/excelize/v2"
)

type ReporteHandler struct {
	EquipoRepo *repository.EquipoRepository
	ConfigRepo *repository.ConfigRepository
	TagRepo    *repository.TagDescubiertoRepository
	TiempoSvc  *services.TiempoActivoService
	ParadaSvc  *services.ParadaService
	AlarmaSvc  *services.AlarmaService
}

func NewReporteHandler(
	equipoRepo *repository.EquipoRepository,
	configRepo *repository.ConfigRepository,
	tagRepo *repository.TagDescubiertoRepository,
	tiempoSvc *services.TiempoActivoService,
	paradaSvc *services.ParadaService,
	alarmaSvc *services.AlarmaService,
) *ReporteHandler {
	return &ReporteHandler{
		EquipoRepo: equipoRepo,
		ConfigRepo: configRepo,
		TagRepo:    tagRepo,
		TiempoSvc:  tiempoSvc,
		ParadaSvc:  paradaSvc,
		AlarmaSvc:  alarmaSvc,
	}
}

// GET /api/reporte/export?equipo_id=75&desde=2026-11-13&hasta=2026-11-14
func (h *ReporteHandler) Exportar(w http.ResponseWriter, r *http.Request) {
	equipoIDStr := mux.Vars(r)["id"]
	if equipoIDStr == "" {
		equipoIDStr = r.URL.Query().Get("equipo_id")
	}
	equipoID, err := strconv.Atoi(equipoIDStr)
	if err != nil || equipoID <= 0 {
		utils.ErrorJSON(w, 400, "equipo_id inválido")
		return
	}

	desde, hasta, err := parseRangoOperativo(r)
	if err != nil {
		utils.ErrorJSON(w, 400, err.Error())
		return
	}

	equipo, err := h.EquipoRepo.ObtenerEquipoPorID(equipoID)
	if err != nil || equipo == nil {
		utils.ErrorJSON(w, 404, "equipo no encontrado")
		return
	}

	proceso, subproceso, _ := h.EquipoRepo.ObtenerUbicacionEquipo(equipoID)

	umbrales, err := h.ConfigRepo.ListarUmbralesPorEquipo(equipoID)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	f := excelize.NewFile()
	defer f.Close()

	// Estilos comunes
	styleTitulo, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 14},
	})
	styleSubtitulo, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Italic: true, Size: 10, Color: "666666"},
	})
	styleHeader, _ := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Color: "FFFFFF"},
		Fill: excelize.Fill{Type: "pattern", Pattern: 1, Color: []string{"2F5496"}},
		Alignment: &excelize.Alignment{
			Horizontal: "center",
			Vertical:   "center",
		},
		Border: []excelize.Border{
			{Type: "left", Color: "000000", Style: 1},
			{Type: "right", Color: "000000", Style: 1},
			{Type: "top", Color: "000000", Style: 1},
			{Type: "bottom", Color: "000000", Style: 1},
		},
	})
	styleCelda, _ := f.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "left", Color: "CCCCCC", Style: 1},
			{Type: "right", Color: "CCCCCC", Style: 1},
			{Type: "top", Color: "CCCCCC", Style: 1},
			{Type: "bottom", Color: "CCCCCC", Style: 1},
		},
	})

	// ===== HOJA 1: TIEMPOS =====
	hojaT := "Tiempos"
	f.SetSheetName("Sheet1", hojaT)

	// Título
	f.MergeCell(hojaT, "A1", "P1")
	f.SetCellValue(hojaT, "A1",
		fmt.Sprintf("Reporte de tiempos — %s (%s)", equipo.Nombre, equipo.Codigo))
	f.SetCellStyle(hojaT, "A1", "P1", styleTitulo)
	f.SetRowHeight(hojaT, 1, 24)

	// Subtítulo
	f.MergeCell(hojaT, "A2", "P2")
	subtitulo := fmt.Sprintf("%s / %s", proceso, subproceso)
	if proceso == "" {
		subtitulo = equipo.Area
	}
	rango := fmt.Sprintf("%s → %s (hora Perú)",
		desde.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"),
		hasta.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
	f.SetCellValue(hojaT, "A2", fmt.Sprintf("Ubicación: %s  |  Rango: %s", subtitulo, rango))
	f.SetCellStyle(hojaT, "A2", "P2", styleSubtitulo)

	// Encabezados (fila 4)
	headersT := []string{
		"Fecha", "Guardia", "Equipo", "Código",
		"Proceso", "Subproceso",
		"Tag", "PI Point", "Element Path",
		"Parámetro", "Unidad",
		"Inicio", "Fin",
		"Activo", "Inactivo", "Total",
	}
	for i, hd := range headersT {
		cell, _ := excelize.CoordinatesToCellName(i+1, 4)
		f.SetCellValue(hojaT, cell, hd)
	}
	f.SetCellStyle(hojaT, "A4", "P4", styleHeader)
	f.SetRowHeight(hojaT, 4, 30)

	fila := 5
	for _, u := range umbrales {
		if u.TagID == nil {
			continue
		}
		tag, _ := h.TagRepo.GetByID(*u.TagID)
		guardias, err := h.TiempoSvc.ResumenPorGuardia(*u.TagID, desde, hasta)
		if err != nil {
			continue
		}
		for _, g := range guardias {
			tagName := ""
			piPoint := ""
			elementPath := ""
			if tag != nil {
				tagName = tag.TagName
				piPoint = tag.PIPointName
				elementPath = tag.ElementPath
			}
			f.SetCellValue(hojaT, fmt.Sprintf("A%d", fila), g.FechaRef)
			f.SetCellValue(hojaT, fmt.Sprintf("B%d", fila), g.Tipo)
			f.SetCellValue(hojaT, fmt.Sprintf("C%d", fila), equipo.Nombre)
			f.SetCellValue(hojaT, fmt.Sprintf("D%d", fila), equipo.Codigo)
			f.SetCellValue(hojaT, fmt.Sprintf("E%d", fila), proceso)
			f.SetCellValue(hojaT, fmt.Sprintf("F%d", fila), subproceso)
			f.SetCellValue(hojaT, fmt.Sprintf("G%d", fila), tagName)
			f.SetCellValue(hojaT, fmt.Sprintf("H%d", fila), piPoint)
			f.SetCellValue(hojaT, fmt.Sprintf("I%d", fila), elementPath)
			f.SetCellValue(hojaT, fmt.Sprintf("J%d", fila), u.Parametro)
			f.SetCellValue(hojaT, fmt.Sprintf("K%d", fila), u.Unidad)
			f.SetCellValue(hojaT, fmt.Sprintf("L%d", fila), g.GuardiaInicio.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			f.SetCellValue(hojaT, fmt.Sprintf("M%d", fila), g.GuardiaFin.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			f.SetCellValue(hojaT, fmt.Sprintf("N%d", fila), formatDuracion(g.ActivoSegundos))
			f.SetCellValue(hojaT, fmt.Sprintf("O%d", fila), formatDuracion(g.InactivoSegundos))
			f.SetCellValue(hojaT, fmt.Sprintf("P%d", fila), formatDuracion(g.TotalSegundos))
			f.SetCellStyle(hojaT, fmt.Sprintf("A%d", fila), fmt.Sprintf("P%d", fila), styleCelda)
			fila++
		}
	}

	// Anchos de columna
	f.SetColWidth(hojaT, "A", "A", 12)
	f.SetColWidth(hojaT, "B", "B", 8)
	f.SetColWidth(hojaT, "C", "C", 18)
	f.SetColWidth(hojaT, "D", "D", 18)
	f.SetColWidth(hojaT, "E", "E", 15)
	f.SetColWidth(hojaT, "F", "F", 20)
	f.SetColWidth(hojaT, "G", "G", 12)
	f.SetColWidth(hojaT, "H", "H", 22)
	f.SetColWidth(hojaT, "I", "I", 50)
	f.SetColWidth(hojaT, "J", "J", 12)
	f.SetColWidth(hojaT, "K", "K", 8)
	f.SetColWidth(hojaT, "L", "M", 20)
	f.SetColWidth(hojaT, "N", "P", 12)

	// ===== HOJA 2: PARADAS =====
	hojaP := "Paradas"
	f.NewSheet(hojaP)

	f.MergeCell(hojaP, "A1", "L1")
	f.SetCellValue(hojaP, "A1",
		fmt.Sprintf("Reporte de paradas — %s (%s)", equipo.Nombre, equipo.Codigo))
	f.SetCellStyle(hojaP, "A1", "L1", styleTitulo)
	f.SetRowHeight(hojaP, 1, 24)

	f.MergeCell(hojaP, "A2", "L2")
	f.SetCellValue(hojaP, "A2", fmt.Sprintf("Rango: %s", rango))
	f.SetCellStyle(hojaP, "A2", "L2", styleSubtitulo)

	headersP := []string{
		"ID", "Equipo", "Código", "Proceso", "Subproceso",
		"Tag", "Inicio", "Fin", "Duración",
		"Motivo", "Responsable", "Área",
	}
	for i, hd := range headersP {
		cell, _ := excelize.CoordinatesToCellName(i+1, 4)
		f.SetCellValue(hojaP, cell, hd)
	}
	f.SetCellStyle(hojaP, "A4", "L4", styleHeader)
	f.SetRowHeight(hojaP, 4, 30)

	paradas, err := h.ParadaSvc.ListarParadas(desde, hasta, &equipoID)
	if err == nil {
		for rowIdx, p := range paradas {
			row := rowIdx + 5
			tagName := ""
			if p.TagID != nil {
				if t, _ := h.TagRepo.GetByID(*p.TagID); t != nil {
					tagName = t.TagName
				}
			}
			f.SetCellValue(hojaP, fmt.Sprintf("A%d", row), p.ID)
			f.SetCellValue(hojaP, fmt.Sprintf("B%d", row), equipo.Nombre)
			f.SetCellValue(hojaP, fmt.Sprintf("C%d", row), equipo.Codigo)
			f.SetCellValue(hojaP, fmt.Sprintf("D%d", row), proceso)
			f.SetCellValue(hojaP, fmt.Sprintf("E%d", row), subproceso)
			f.SetCellValue(hojaP, fmt.Sprintf("F%d", row), tagName)
			f.SetCellValue(hojaP, fmt.Sprintf("G%d", row), p.Inicio.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			f.SetCellValue(hojaP, fmt.Sprintf("H%d", row), p.Fin.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			f.SetCellValue(hojaP, fmt.Sprintf("I%d", row), formatDuracion(p.DuracionMinutos*60))
			f.SetCellValue(hojaP, fmt.Sprintf("J%d", row), p.Motivo)
			f.SetCellValue(hojaP, fmt.Sprintf("K%d", row), p.PersonalResponsable)
			f.SetCellValue(hojaP, fmt.Sprintf("L%d", row), p.AreaResponsable)
			f.SetCellStyle(hojaP, fmt.Sprintf("A%d", row), fmt.Sprintf("L%d", row), styleCelda)
		}
	}

	f.SetColWidth(hojaP, "A", "A", 8)
	f.SetColWidth(hojaP, "B", "B", 18)
	f.SetColWidth(hojaP, "C", "C", 18)
	f.SetColWidth(hojaP, "D", "D", 15)
	f.SetColWidth(hojaP, "E", "E", 20)
	f.SetColWidth(hojaP, "F", "F", 12)
	f.SetColWidth(hojaP, "G", "H", 20)
	f.SetColWidth(hojaP, "I", "I", 12)
	f.SetColWidth(hojaP, "J", "J", 30)
	f.SetColWidth(hojaP, "K", "K", 20)
	f.SetColWidth(hojaP, "L", "L", 15)

	// ===== HOJA 3: ALARMAS =====
	hojaA := "Alarmas"
	f.NewSheet(hojaA)

	f.MergeCell(hojaA, "A1", "L1")
	f.SetCellValue(hojaA, "A1",
		fmt.Sprintf("Reporte de alarmas — %s (%s)", equipo.Nombre, equipo.Codigo))
	f.SetCellStyle(hojaA, "A1", "L1", styleTitulo)
	f.SetRowHeight(hojaA, 1, 24)

	f.MergeCell(hojaA, "A2", "L2")
	f.SetCellValue(hojaA, "A2", fmt.Sprintf("Rango: %s", rango))
	f.SetCellStyle(hojaA, "A2", "L2", styleSubtitulo)

	headersA := []string{
		"ID", "Equipo", "Código", "Proceso", "Subproceso",
		"Tag", "Parámetro", "Mensaje",
		"Severidad", "Estado", "Fecha generada", "Fecha cierre",
	}
	for i, hd := range headersA {
		cell, _ := excelize.CoordinatesToCellName(i+1, 4)
		f.SetCellValue(hojaA, cell, hd)
	}
	f.SetCellStyle(hojaA, "A4", "L4", styleHeader)
	f.SetRowHeight(hojaA, 4, 30)

	alarmas, err := h.AlarmaSvc.ListarPorEquipo(equipoID)
	if err == nil {
		row := 5
		for _, a := range alarmas {
			if a.FechaGenerada.Before(desde) || a.FechaGenerada.After(hasta) {
				continue
			}
			tagName := ""
			if a.TagID != nil {
				if t, _ := h.TagRepo.GetByID(*a.TagID); t != nil {
					tagName = t.TagName
				}
			}
			param := ""
			if a.Parametro != nil {
				param = *a.Parametro
			}
			f.SetCellValue(hojaA, fmt.Sprintf("A%d", row), a.ID)
			f.SetCellValue(hojaA, fmt.Sprintf("B%d", row), equipo.Nombre)
			f.SetCellValue(hojaA, fmt.Sprintf("C%d", row), equipo.Codigo)
			f.SetCellValue(hojaA, fmt.Sprintf("D%d", row), proceso)
			f.SetCellValue(hojaA, fmt.Sprintf("E%d", row), subproceso)
			f.SetCellValue(hojaA, fmt.Sprintf("F%d", row), tagName)
			f.SetCellValue(hojaA, fmt.Sprintf("G%d", row), param)
			f.SetCellValue(hojaA, fmt.Sprintf("H%d", row), a.Mensaje)
			f.SetCellValue(hojaA, fmt.Sprintf("I%d", row), a.Severidad)
			f.SetCellValue(hojaA, fmt.Sprintf("J%d", row), a.Estado)
			f.SetCellValue(hojaA, fmt.Sprintf("K%d", row), a.FechaGenerada.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			if a.FechaCierre != nil {
				f.SetCellValue(hojaA, fmt.Sprintf("L%d", row), a.FechaCierre.In(time.FixedZone("PET", -5*3600)).Format("2006-01-02 15:04:05"))
			}
			f.SetCellStyle(hojaA, fmt.Sprintf("A%d", row), fmt.Sprintf("L%d", row), styleCelda)
			row++
		}
	}

	f.SetColWidth(hojaA, "A", "A", 8)
	f.SetColWidth(hojaA, "B", "B", 18)
	f.SetColWidth(hojaA, "C", "C", 18)
	f.SetColWidth(hojaA, "D", "D", 15)
	f.SetColWidth(hojaA, "E", "E", 20)
	f.SetColWidth(hojaA, "F", "F", 12)
	f.SetColWidth(hojaA, "G", "G", 12)
	f.SetColWidth(hojaA, "H", "H", 40)
	f.SetColWidth(hojaA, "I", "I", 12)
	f.SetColWidth(hojaA, "J", "J", 10)
	f.SetColWidth(hojaA, "K", "L", 20)

	// Enviar
	filename := fmt.Sprintf("reporte_%s_%s_%s.xlsx",
		equipo.Codigo, desde.Format("20060102"), hasta.Format("20060102"))
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	if err := f.Write(w); err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func parseRangoOperativo(r *http.Request) (time.Time, time.Time, error) {
	q := r.URL.Query()
	desdeStr := q.Get("desde")
	hastaStr := q.Get("hasta")

	loc, err := time.LoadLocation("America/Lima")
	if err != nil {
		loc = time.FixedZone("PET", -5*3600)
	}
	if desdeStr == "" {
		desdeStr = time.Now().In(loc).Format("2006-01-02")
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

	desde := desdeLocal.Add(7 * time.Hour)
	hasta := hastaLocal.Add(7 * time.Hour).Add(24 * time.Hour)
	return desde.UTC(), hasta.UTC(), nil
}

func formatDuracion(segundos int) string {
	if segundos < 60 {
		return fmt.Sprintf("%ds", segundos)
	}
	h := segundos / 3600
	m := (segundos % 3600) / 60
	s := segundos % 60
	if h > 0 {
		if s > 0 {
			return fmt.Sprintf("%dh %dmin %ds", h, m, s)
		}
		if m > 0 {
			return fmt.Sprintf("%dh %dmin", h, m)
		}
		return fmt.Sprintf("%dh", h)
	}
	if s > 0 {
		return fmt.Sprintf("%dmin %ds", m, s)
	}
	return fmt.Sprintf("%dmin", m)
}
