// engine/rule_engine.go
package engine

import (
	"fmt"
	"log"
	"time"

	"backend/models"
	"backend/repository"
	"backend/services"
)

type RuleEngine struct {
	ConfigRepo         *repository.ConfigRepository
	SensorRepo         *repository.SensorRepository
	DecisionService    *services.DecisionService
	AlarmaService      *services.AlarmaService
	EventoService      *services.EventosService
	NotifierService    *services.NotifierService
	EquipoRepo         *repository.EquipoRepository
	Dispatcher         *services.DispatcherService
	TagDescubiertoRepo *repository.TagDescubiertoRepository
}

func NewRuleEngine(
	configRepo *repository.ConfigRepository,
	sensorRepo *repository.SensorRepository,
	decisionService *services.DecisionService,
	alarmaService *services.AlarmaService,
	eventoService *services.EventosService,
	notifierService *services.NotifierService,
	equipoRepo *repository.EquipoRepository,
	dispatcher *services.DispatcherService,
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *RuleEngine {
	return &RuleEngine{
		ConfigRepo:         configRepo,
		SensorRepo:         sensorRepo,
		DecisionService:    decisionService,
		AlarmaService:      alarmaService,
		EventoService:      eventoService,
		NotifierService:    notifierService,
		EquipoRepo:         equipoRepo,
		Dispatcher:         dispatcher,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
}

func (e *RuleEngine) ProcessSensorData(reading models.SensorReading, timestamp time.Time) {
	log.Printf("🔍 ProcessSensorData: Equipo=%d, Tag=%s, Valor=%.3f",
		reading.EquipmentID, reading.TagName, reading.Value)

	// ============================================
	// 1. DATOS SIN EQUIPO → GUARDAR EN DESCUBIERTOS
	// ============================================
	if reading.EquipmentID <= 0 {
		log.Printf("📌 Tag SIN EQUIPO detectado: %s = %.3f %s",
			reading.TagName, reading.Value, reading.Unit)

		// Verificar que TagName no esté vacío
		if reading.TagName == "" {
			log.Printf("⚠️ TagName vacío, ignorando")
			return
		}

		// Guardar en tags_descubiertos
		tag := &models.TagDescubierto{
			TagName:             reading.TagName,
			TagPath:             reading.ElementPath,
			ElementName:         reading.ElementName,
			ElementPath:         reading.ElementPath,
			PIPointName:         reading.PIPointName,
			Unidad:              reading.Unit,
			UltimoValor:         reading.Value,
			UltimaActualizacion: timestamp,
			Source:              reading.Source,
		}

		err := e.TagDescubiertoRepo.Upsert(tag)
		if err != nil {
			log.Printf("❌ Error guardando tag descubierto: %v", err)
		} else {
			log.Printf("✅ Tag descubierto guardado: %s (frecuencia: %d)",
				reading.TagName, tag.Frecuencia)
		}
		return

	}

	// ============================================
	// 2. DATOS CON EQUIPO → GUARDAR NORMAL
	// ============================================
	decision := e.DecisionService.DecidirGuardado(reading, timestamp)

	if decision.Guardar {
		err := e.SensorRepo.GuardarDato(
			reading.EquipmentID,
			reading.TagName,
			reading.Value,
			reading.Unit,
			reading.Source,
			reading.Quality,
			timestamp,
		)
		if err != nil {
			log.Printf("❌ Error guardando dato: %v", err)
		} else {
			log.Printf("✅ Dato GUARDADO: Equipo=%d, %s=%.3f %s",
				reading.EquipmentID, reading.TagName, reading.Value, reading.Unit)
		}
	} else {
		log.Printf("⏭️ Dato NO guardado: Equipo=%d, %s=%.3f %s (motivo: %s)",
			reading.EquipmentID, reading.TagName, reading.Value, reading.Unit, decision.Motivo)
	}

	// ============================================
	// 3. ACTUALIZAR ÚLTIMO VALOR (SIEMPRE)
	// ============================================
	e.SensorRepo.ActualizarUltimoValor(
		reading.EquipmentID,
		reading.TagName,
		reading.Value,
		reading.Unit,
		reading.Source,
		reading.Quality,
		timestamp,
	)

	// ============================================
	// 4. EVALUAR UMBRALES (ALARMAS)
	// ============================================
	umbrales, err := e.ConfigRepo.ObtenerUmbrales(reading.EquipmentID, reading.TagName)
	if err != nil || umbrales == nil {
		return
	}

	if (umbrales.UmbralMin != nil && reading.Value < *umbrales.UmbralMin) ||
		(umbrales.UmbralMax != nil && reading.Value > *umbrales.UmbralMax) {

		log.Printf("🚨 ALARMA: %s = %.3f está fuera de rango", reading.TagName, reading.Value)

		evento := &models.DatoEvento{
			EquipoID:        reading.EquipmentID,
			TipoEvento:      "alarma",
			Descripcion:     fmt.Sprintf("%s = %.3f %s (fuera de rango)", reading.TagName, reading.Value, reading.Unit),
			ValorNuevo:      &reading.Value,
			Parametro:       reading.TagName,
			TimestampEvento: timestamp,
		}
		e.DecisionService.ConfigGuardadoRepo.GuardarEvento(evento)

		if e.EventoService != nil {
			e.EventoService.CambiarEstadoEquipo(reading.EquipmentID, "fallo",
				"Valor fuera de rango: "+reading.TagName)
		}

		if e.AlarmaService != nil {
			motivoAlarma := fmt.Sprintf("%s = %.3f %s (fuera de rango)",
				reading.TagName, reading.Value, reading.Unit)
			e.AlarmaService.GenerarAlarmaPorFallo(reading.EquipmentID, motivoAlarma)
		}
	}
}

func (e *RuleEngine) ProcessPingResult(equipoID int, failedAttempts int, maxRetries int) {
	if maxRetries < 1 {
		maxRetries = 6
	}

	if failedAttempts != maxRetries {
		return
	}

	motivo := fmt.Sprintf("Sin respuesta de ping después de %d intentos", failedAttempts)
	log.Printf("🚨 Equipo %d cambió a FALLO por ping", equipoID)

	err := e.EventoService.CambiarEstadoEquipo(equipoID, "fallo", motivo)
	if err != nil {
		log.Printf("Error cambiando estado: %v", err)
		return
	}

	// Propagar a hijos
	err = e.EquipoRepo.PropagarEstadoHijos(equipoID, "fallo",
		fmt.Sprintf("Padre ID %d en fallo por ping", equipoID))
	if err != nil {
		log.Printf("Error propagando estado a hijos: %v", err)
	}

	e.Dispatcher.Dispatch(equipoID, "fallo", "alta", motivo)
}

func (e *RuleEngine) ProcessPingRecovery(equipoID int, latency float64) {
	equipo, _ := e.EquipoRepo.ObtenerEquipoPorID(equipoID)

	if equipo.EstadoEquipo != "fallo" {
		return
	}

	motivo := fmt.Sprintf("Conexión restablecida. Latencia: %.0fms", latency)
	e.EventoService.CambiarEstadoEquipo(equipoID, "activo", motivo)
	e.AlarmaService.CerrarAlarmasActivasPorEquipo(equipoID)

	// Recuperar también los hijos
	e.EquipoRepo.PropagarEstadoHijos(equipoID, "activo",
		fmt.Sprintf("Padre ID %d recuperado", equipoID))

	e.Dispatcher.Dispatch(equipoID, "recuperacion", "info", motivo)

	log.Printf("🟢 Equipo %d y sus hijos recuperados", equipoID)
}
