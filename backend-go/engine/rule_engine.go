// engine/rule_engine.go
package engine

import (
	"fmt"
	"log"
	"sync"
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

	tagEquipoCache map[string]int
	tagCacheMu     sync.RWMutex
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

		tagEquipoCache: make(map[string]int),
	}
}

func (e *RuleEngine) ProcessSensorData(reading models.SensorReading, timestamp time.Time) {
	log.Printf(
		"🔍 ProcessSensorData: Equipo=%d, Tag=%s, Valor=%.3f",
		reading.EquipmentID,
		reading.TagName,
		reading.Value,
	)

	if reading.EquipmentID <= 0 {

		if reading.TagName == "" {
			log.Printf("⚠️ TagName vacío, ignorando lectura")
			return
		}

		if equipoID, existe := e.obtenerEquipoDesdeCache(reading); existe {

			reading.EquipmentID = equipoID

			log.Printf(
				"⚡ ASIGNACIÓN DESDE CACHÉ: Tag=%s | PIPoint=%s → EquipoID=%d",
				reading.TagName,
				reading.PIPointName,
				reading.EquipmentID,
			)

		} else {

			equipoID, err := e.TagDescubiertoRepo.ObtenerEquipoIDPorTag(
				reading.TagName,
				reading.ElementPath,
				reading.PIPointName,
			)

			if err != nil {
				log.Printf(
					"❌ Error buscando asignación: Tag=%s | ElementPath=%s | PIPoint=%s | Error=%v",
					reading.TagName,
					reading.ElementPath,
					reading.PIPointName,
					err,
				)
				return
			}

			if equipoID != nil {

				reading.EquipmentID = *equipoID

				e.guardarEquipoEnCache(
					reading,
					reading.EquipmentID,
				)

				log.Printf(
					"🔗 ASIGNACIÓN APLICADA: Tag=%s | PIPoint=%s → EquipoID=%d",
					reading.TagName,
					reading.PIPointName,
					reading.EquipmentID,
				)

			} else {

				tag := &models.TagDescubierto{
					TagName:             reading.TagName,
					TagPath:             reading.ElementPath,
					ElementName:         reading.ElementName,
					ElementPath:         reading.ElementPath,
					PIPointName:         reading.PIPointName,
					PiServer:            reading.PiServer,
					DatabaseName:        reading.Database,
					RootElement:         reading.RootElement,
					Unidad:              reading.Unit,
					UltimoValor:         reading.Value,
					UltimaActualizacion: timestamp,
					Source:              reading.Source,
					Quality:             reading.Quality,
					RutaCompleta:        reading.RutaCompleta,
					NivelJerarquico:     reading.NivelJerarquico,
					ElementoPadre:       reading.ElementoPadre,
					PathJerarquico:      reading.PathJerarquico,
					ElementosAncestros:  reading.ElementosAncestros,
				}

				if err := e.TagDescubiertoRepo.Upsert(tag); err != nil {
					log.Printf(
						"❌ Error guardando tag descubierto: Tag=%s | PIPoint=%s | Error=%v",
						reading.TagName,
						reading.PIPointName,
						err,
					)
				} else {
					log.Printf(
						"🆕 Tag sin equipo: Tag=%s | PIPoint=%s",
						reading.TagName,
						reading.PIPointName,
					)
				}

				return
			}
		}
	}

	if reading.EquipmentID <= 0 {
		log.Printf(
			"⚠️ Lectura sin EquipoID después de la resolución: Tag=%s | PIPoint=%s",
			reading.TagName,
			reading.PIPointName,
		)
		return
	}

	decision := e.DecisionService.DecidirGuardado(
		reading,
		timestamp,
	)

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
			log.Printf(
				"❌ Error guardando dato: %v",
				err,
			)
		} else {
			log.Printf(
				"💾 Dato guardado: Equipo=%d | Tag=%s | Valor=%.3f | Unidad=%s | Fuente=%s",
				reading.EquipmentID,
				reading.TagName,
				reading.Value,
				reading.Unit,
				reading.Source,
			)

			log.Printf(
				"✅ Dato GUARDADO: Equipo=%d, %s=%.3f %s",
				reading.EquipmentID,
				reading.TagName,
				reading.Value,
				reading.Unit,
			)
		}

	} else {

		log.Printf(
			"⏭️ Dato NO guardado: Equipo=%d, %s=%.3f %s (motivo: %s)",
			reading.EquipmentID,
			reading.TagName,
			reading.Value,
			reading.Unit,
			decision.Motivo,
		)
	}

	err := e.SensorRepo.ActualizarUltimoValor(
		reading.EquipmentID,
		reading.TagName,
		reading.Value,
		reading.Unit,
		reading.Source,
		reading.Quality,
		timestamp,
	)

	if err != nil {
		log.Printf(
			"⚠️ Error actualizando último valor: Equipo=%d | Tag=%s | Error=%v",
			reading.EquipmentID,
			reading.TagName,
			err,
		)
	}

	umbrales, err := e.ConfigRepo.ObtenerUmbrales(
		reading.EquipmentID,
		reading.TagName,
	)

	if err != nil {
		log.Printf(
			"⚠️ Error obteniendo umbrales: Equipo=%d | Tag=%s | Error=%v",
			reading.EquipmentID,
			reading.TagName,
			err,
		)
		return
	}

	if umbrales == nil {
		return
	}

	fueraDeRango :=
		(umbrales.UmbralMin != nil && reading.Value < *umbrales.UmbralMin) ||
			(umbrales.UmbralMax != nil && reading.Value > *umbrales.UmbralMax)

	if !fueraDeRango {
		return
	}

	log.Printf(
		"🚨 ALARMA: Equipo=%d | %s=%.3f está fuera de rango",
		reading.EquipmentID,
		reading.TagName,
		reading.Value,
	)

	evento := &models.DatoEvento{
		EquipoID:   reading.EquipmentID,
		TipoEvento: "alarma",
		Descripcion: fmt.Sprintf(
			"%s = %.3f %s (fuera de rango)",
			reading.TagName,
			reading.Value,
			reading.Unit,
		),
		ValorNuevo:      &reading.Value,
		Parametro:       reading.TagName,
		TimestampEvento: timestamp,
	}

	if err := e.DecisionService.ConfigGuardadoRepo.GuardarEvento(evento); err != nil {
		log.Printf(
			"⚠️ Error guardando evento de alarma: %v",
			err,
		)
	}

	if e.EventoService != nil {
		if err := e.EventoService.CambiarEstadoEquipo(
			reading.EquipmentID,
			"fallo",
			"Valor fuera de rango: "+reading.TagName,
		); err != nil {
			log.Printf(
				"⚠️ Error cambiando estado del equipo: %v",
				err,
			)
		}
	}

	if e.AlarmaService != nil {
		motivoAlarma := fmt.Sprintf(
			"%s = %.3f %s (fuera de rango)",
			reading.TagName,
			reading.Value,
			reading.Unit,
		)

		e.AlarmaService.GenerarAlarmaPorFallo(
			reading.EquipmentID,
			motivoAlarma,
		)
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

func (e *RuleEngine) obtenerEquipoDesdeCache(
	reading models.SensorReading,
) (int, bool) {

	clave := reading.TagName + "|" +
		reading.ElementPath + "|" +
		reading.PIPointName

	e.tagCacheMu.RLock()
	equipoID, existe := e.tagEquipoCache[clave]
	e.tagCacheMu.RUnlock()

	return equipoID, existe
}

func (e *RuleEngine) guardarEquipoEnCache(
	reading models.SensorReading,
	equipoID int,
) {

	if equipoID <= 0 {
		return
	}

	clave := reading.TagName + "|" +
		reading.ElementPath + "|" +
		reading.PIPointName

	e.tagCacheMu.Lock()
	e.tagEquipoCache[clave] = equipoID
	e.tagCacheMu.Unlock()

	log.Printf(
		"🧠 Caché asignación: Tag=%s | PIPoint=%s → EquipoID=%d",
		reading.TagName,
		reading.PIPointName,
		equipoID,
	)
}
