// engine/rule_engine.go
package engine

import (
	"fmt"
	"log"
	"sync"
	"time"
	"strings"

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
    AlertaService      *services.AlertaService
	TiempoActivoService *services.TiempoActivoService

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
	alertaService *services.AlertaService,
	tiempoActivoService *services.TiempoActivoService,
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
		AlertaService:      alertaService,
		TiempoActivoService: tiempoActivoService,

		tagEquipoCache: make(map[string]int),
	}
}

func (e *RuleEngine) ProcessSensorData(reading models.SensorReading, timestamp time.Time) {
	log.Printf(
		"🔍 ProcessSensorData: Tag=%s, Valor=%.3f",
		reading.TagName,
		reading.Value,
	)
	// Ignorar lecturas sin calidad Good.
	if !strings.EqualFold(reading.Quality, "Good") {
		log.Printf(
			"Lectura ignorada por calidad: tag=%s quality=%s valor=%.3f",
			reading.TagName, reading.Quality, reading.Value,
		)
		return
	}
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

// ============================================
// RESOLVER ACTIVOS DEL TAG (equipo, componente, repuesto)
// ============================================

// Intentar obtener el tag_id desde tags_descubiertos
var tagID int
tagDesc, _ := e.TagDescubiertoRepo.ObtenerTagPorEquipoYNombre(
    reading.EquipmentID,
    reading.TagName,
)
if tagDesc != nil {
    tagID = tagDesc.ID
}

// Resolver los 3 activos del tag
var equipoActivoID *int
var componenteActivoID *int
var repuestoActivoID *int
var umbral *models.ConfigUmbral

if tagID > 0 {
    eqID, compID, repID, err := e.TagDescubiertoRepo.ObtenerActivosDelTag(tagID)
    if err != nil {
        log.Printf("Error obteniendo activos del tag %d: %v", tagID, err)
    }
    equipoActivoID = eqID
    componenteActivoID = compID
    repuestoActivoID = repID

    // Buscar umbral por tag
    u, err := e.ConfigRepo.ObtenerUmbralesPorTag(tagID, reading.TagName)
    if err == nil && u != nil {
        umbral = u
    }
}

// Fallback legacy: si no hay tag_id ni umbral por tag,
// buscar por equipo como antes
if umbral == nil {
    u, err := e.ConfigRepo.ObtenerUmbrales(
        reading.EquipmentID,
        reading.TagName,
    )
    if err != nil {
        log.Printf(
            "Error obteniendo umbrales legacy: Equipo=%d | Tag=%s | Error=%v",
            reading.EquipmentID, reading.TagName, err,
        )
        return
    }
    if u == nil {
        return
    }
    umbral = u
}

// ============================================
// EVALUAR ACTIVOS
// ============================================

log.Printf(
    "Evaluando tag=%s valor=%.3f equipo=%v componente=%v repuesto=%v",
    reading.TagName, reading.Value,
    ptrOrZero(equipoActivoID),
    ptrOrZero(componenteActivoID),
    ptrOrZero(repuestoActivoID),
)
// Registrar tiempo activo si está configurado
if umbral != nil && umbral.ContarTiempoActivo && e.TiempoActivoService != nil {
    eqID := ptrOrZero(equipoActivoID)
    compID := ptrOrZero(componenteActivoID)
    repID := ptrOrZero(repuestoActivoID)

    activoTipo := "equipo"
    activoID := eqID
    if compID > 0 {
        activoTipo = "componente"
        activoID = compID
    } else if repID > 0 {
        activoTipo = "repuesto"
        activoID = repID
    }

    e.TiempoActivoService.RegistrarLectura(
        tagID, activoTipo, activoID,
        reading.Value, reading.Quality, timestamp,
    )
}
fueraDeRango :=
    (umbral.UmbralMin != nil && reading.Value < *umbral.UmbralMin) ||
    (umbral.UmbralMax != nil && reading.Value > *umbral.UmbralMax)

if !fueraDeRango {
    return
}

motivo := fmt.Sprintf(
    "%s = %.3f %s (fuera de rango: min=%s max=%s)",
    reading.TagName, reading.Value, reading.Unit,
    fmtFloatPtr(umbral.UmbralMin), fmtFloatPtr(umbral.UmbralMax),
)

// ----- Activo: equipo -----
if equipoActivoID != nil && *equipoActivoID > 0 {
    log.Printf("EVAL EQUIPO: Equipo=%d modo=%s | %s", *equipoActivoID, umbral.Modo, motivo)

    eventoEq := &models.DatoEvento{
        EquipoID:        *equipoActivoID,
        TipoEvento:      "alarma",
        Descripcion:     motivo,
        ValorNuevo:      &reading.Value,
        Parametro:       reading.TagName,
        TagID:           &tagID,
        TimestampEvento: timestamp,
    }
    if err := e.DecisionService.ConfigGuardadoRepo.GuardarEvento(eventoEq); err != nil {
        log.Printf("Error guardando evento equipo: %v", err)
    }

    if umbral.Modo == "alerta" {
        // Modo alerta: no cambia estado, solo crea alerta
        if e.AlertaService != nil {
            e.AlertaService.GenerarAlertaPolimorfica(
                *equipoActivoID, nil, nil, &tagID, &reading.TagName,
                &reading.Value, umbral.UmbralMin, umbral.UmbralMax, motivo,
            )
        }
    } else {
        // Modo fallo: cambia estado + alarma
        if e.EventoService != nil {
            if err := e.EventoService.CambiarEstadoActivo(
                *equipoActivoID, nil, nil, &tagID, &reading.TagName,
                "fallo", "Valor fuera de rango: "+reading.TagName,
            ); err != nil {
                log.Printf("Error cambiando estado equipo: %v", err)
            }
        }
        if e.AlarmaService != nil {
            e.AlarmaService.GenerarAlarmaPolimorfica(
                *equipoActivoID, nil, nil, &tagID, &reading.TagName, motivo,
            )
        }
    }
}

// ----- Activo: componente -----
if componenteActivoID != nil && *componenteActivoID > 0 {
    // Equipo padre del componente
    eqPadre, err := e.EquipoRepo.ObtenerEquipoPadreDeComponente(*componenteActivoID)
    if err != nil || eqPadre <= 0 {
        log.Printf(
            "Componente %d sin equipo padre, se omite alarma",
            *componenteActivoID,
        )
    } else {
        log.Printf(
            "ALARMA COMPONENTE: Componente=%d (equipo=%d) | %s",
            *componenteActivoID, eqPadre, motivo,
        )

        eventoComp := &models.DatoEvento{
            EquipoID:     eqPadre,
            ComponenteID: componenteActivoID,
            TipoEvento:   "alarma",
            Descripcion:  motivo,
            ValorNuevo:   &reading.Value,
            Parametro:    reading.TagName,
            TagID:        &tagID,
            TimestampEvento: timestamp,
        }
        if err := e.DecisionService.ConfigGuardadoRepo.GuardarEvento(eventoComp); err != nil {
            log.Printf("Error guardando evento componente: %v", err)
        }

        if e.EventoService != nil {
            if err := e.EventoService.CambiarEstadoActivo(
                eqPadre, componenteActivoID, nil, &tagID, &reading.TagName,
                "fallo", "Valor fuera de rango: "+reading.TagName,
            ); err != nil {
                log.Printf("Error cambiando estado componente: %v", err)
            }
        }

        if e.AlarmaService != nil {
            e.AlarmaService.GenerarAlarmaPolimorfica(
                eqPadre, componenteActivoID, nil, &tagID, &reading.TagName, motivo,
            )
        }
    }
}

// ----- Activo: repuesto -----
if repuestoActivoID != nil && *repuestoActivoID > 0 {
    eqPadre, err := e.EquipoRepo.ObtenerEquipoPadreDeRepuesto(*repuestoActivoID)
    if err != nil || eqPadre <= 0 {
        log.Printf(
            "Repuesto %d sin equipo padre, se omite alarma",
            *repuestoActivoID,
        )
    } else {
        log.Printf(
            "ALARMA REPUESTO: Repuesto=%d (equipo=%d) | %s",
            *repuestoActivoID, eqPadre, motivo,
        )

        eventoRep := &models.DatoEvento{
            EquipoID:     eqPadre,
            RepuestoID:   repuestoActivoID,
            TipoEvento:   "alarma",
            Descripcion:  motivo,
            ValorNuevo:   &reading.Value,
            Parametro:    reading.TagName,
            TagID:        &tagID,
            TimestampEvento: timestamp,
        }
        if err := e.DecisionService.ConfigGuardadoRepo.GuardarEvento(eventoRep); err != nil {
            log.Printf("Error guardando evento repuesto: %v", err)
        }

        if e.EventoService != nil {
            if err := e.EventoService.CambiarEstadoActivo(
                eqPadre, nil, repuestoActivoID, &tagID, &reading.TagName,
                "fallo", "Valor fuera de rango: "+reading.TagName,
            ); err != nil {
                log.Printf("Error cambiando estado repuesto: %v", err)
            }
        }                           

        if e.AlarmaService != nil { 
            e.AlarmaService.GenerarAlarmaPolimorfica(
                eqPadre, nil, repuestoActivoID, &tagID, &reading.TagName, motivo,
            )
        } 
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
func ptrOrZero(p *int) int {
	if p == nil {
		return 0
	}
	return *p
}
func fmtFloatPtr(p *float64) string {
	if p == nil {
		return "-"
	}
	return fmt.Sprintf("%.3f", *p)
}