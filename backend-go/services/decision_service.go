// services/decision_service.go
package services

import (
	"log"
	"math"
	"time"

	"backend/models"
	"backend/repository"
)

type DecisionService struct {
	ConfigGuardadoRepo *repository.ConfigGuardadoRepository
	SensorRepo         *repository.SensorRepository
}

func NewDecisionService(
	configGuardadoRepo *repository.ConfigGuardadoRepository,
	sensorRepo *repository.SensorRepository,
) *DecisionService {
	return &DecisionService{
		ConfigGuardadoRepo: configGuardadoRepo,
		SensorRepo:         sensorRepo,
	}
}

type DecisionResult struct {
	Guardar     bool
	Motivo      string
	Prioridad   string
	DebeEvaluar bool
}

// DecidirGuardado - Retorna si debemos guardar el dato
func (s *DecisionService) DecidirGuardado(
	reading models.SensorReading,
	timestamp time.Time,
) DecisionResult {

	result := DecisionResult{Guardar: false, Motivo: "", Prioridad: "normal", DebeEvaluar: false}

	// ============================================
	// 1. VERIFICAR CALIDAD
	// ============================================
	if reading.Quality == "Bad" {
		log.Printf("⚠️ Calidad BAD para %s - NO guardando", reading.TagName)
		result.Motivo = "calidad_bad"
		return result
	}

	// ============================================
	// 2. OBTENER PRIORIDAD
	// ============================================
	prioridad, err := s.obtenerPrioridad(reading.EquipmentID, reading.TagName)
	if err != nil {
		log.Printf("⚠️ Error obteniendo prioridad: %v", err)
		// Usar prioridad por defecto
		prioridad, _ = s.ConfigGuardadoRepo.ObtenerPrioridadPorDefecto()
	}

	if prioridad != nil {
		result.Prioridad = prioridad.Nombre
	}

	// ============================================
	// 3. GUARDAR SIEMPRE (prioridad crítica)
	// ============================================
	if prioridad != nil && prioridad.GuardarSiempre {
		result.Guardar = true
		result.Motivo = "guardar_siempre_" + prioridad.Nombre
		return result
	}

	// ============================================
	// 4. EVENTOS ESPECIALES
	// ============================================
	eventoActivo := s.verificarEventoEspecial(reading.EquipmentID, reading.TagName)
	if eventoActivo != nil {
		result.Guardar = true
		result.Motivo = "evento_especial_" + eventoActivo.Nombre
		result.DebeEvaluar = true
		return result
	}

	// ============================================
	// 5. OBTENER ÚLTIMO VALOR GUARDADO
	// ============================================
	ultimo, err := s.SensorRepo.ObtenerUltimoValor(reading.EquipmentID, reading.TagName)
	if err != nil || ultimo == nil {
		// Primer dato - guardar siempre
		result.Guardar = true
		result.Motivo = "primer_dato"
		return result
	}

	// ============================================
	// 6. CALCULAR CAMBIO PORCENTUAL
	// ============================================
	cambio := 0.0
	if ultimo.Valor != 0 {
		cambio = math.Abs((reading.Value - ultimo.Valor) / ultimo.Valor * 100)
	} else if reading.Value != 0 {
		cambio = math.Abs(reading.Value) * 100
	}

	// Cambio significativo (> 20%)
	if cambio > 20 {
		result.Guardar = true
		result.Motivo = "cambio_significativo_20"
		return result
	}

	// Cambio moderado (según prioridad)
	if prioridad != nil && cambio > prioridad.CambioMinimoPorcentaje {
		// Verificar si ya guardamos recientemente
		tiempoDesdeUltimo := time.Since(ultimo.ActualizadoEn)
		if tiempoDesdeUltimo > time.Duration(prioridad.MuestreoIntervaloMinutos)*time.Minute {
			result.Guardar = true
			result.Motivo = "cambio_moderado_y_tiempo"
			return result
		}
		result.Motivo = "cambio_moderado_pero_reciente"
		return result
	}

	// ============================================
	// 7. MUESTREO POR TIEMPO
	// ============================================
	if prioridad != nil {
		tiempoDesdeUltimo := time.Since(ultimo.ActualizadoEn)
		if tiempoDesdeUltimo > time.Duration(prioridad.MuestreoIntervaloMinutos)*time.Minute {
			result.Guardar = true
			result.Motivo = "muestreo_tiempo"
			return result
		}
	}

	// Cambio pequeño o nulo
	if cambio < 0.01 {
		result.Motivo = "sin_cambio"
		return result
	}

	result.Motivo = "no_requerido"
	return result
}

func (s *DecisionService) obtenerPrioridad(equipoID int, parametro string) (*models.ConfigPrioridad, error) {
	// 1. Prioridad por parámetro
	prioridad, err := s.ConfigGuardadoRepo.ObtenerPrioridadPorParametro(parametro)
	if err == nil && prioridad != nil {
		return prioridad, nil
	}

	// 2. Prioridad por equipo
	prioridad, err = s.ConfigGuardadoRepo.ObtenerPrioridadPorEquipo(equipoID)
	if err == nil && prioridad != nil {
		return prioridad, nil
	}

	// 3. Prioridad por defecto
	return s.ConfigGuardadoRepo.ObtenerPrioridadPorDefecto()
}

func (s *DecisionService) verificarEventoEspecial(equipoID int, _ string) *models.ConfigEventoEspecial {
	eventos, err := s.ConfigGuardadoRepo.ObtenerEventosEspeciales()
	if err != nil || len(eventos) == 0 {
		return nil
	}

	for _, evento := range eventos {
		// Filtrar por equipo y/o parámetro
		activo, _ := s.ConfigGuardadoRepo.TieneEventoActivo(equipoID, evento.Nombre)
		if activo {
			return &evento
		}
	}
	return nil
}
