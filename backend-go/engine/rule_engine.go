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

    // Contadores de confirmación por (tagID|parametro)
    confirmaciones   map[string]*contadorConfirmacion
    confirmacionesMu sync.RWMutex
}

type contadorConfirmacion struct {
    fueraConsecutivas  int
    dentroConsecutivas int
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

        confirmaciones: make(map[string]*contadorConfirmacion),
    }
}

func (e *RuleEngine) ProcessSensorData(reading models.SensorReading, timestamp time.Time) {
	log.Printf(
		"ðŸ” ProcessSensorData: Tag=%s, Valor=%.3f",
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
			log.Printf("âš ï¸ TagName vacÃ­o, ignorando lectura")
			return
		}

		if equipoID, existe := e.obtenerEquipoDesdeCache(reading); existe {

			reading.EquipmentID = equipoID

			log.Printf(
				"âš¡ ASIGNACIÃ“N DESDE CACHÃ‰: Tag=%s | PIPoint=%s â†’ EquipoID=%d",
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
					"âŒ Error buscando asignaciÃ³n: Tag=%s | ElementPath=%s | PIPoint=%s | Error=%v",
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
					"ðŸ”— ASIGNACIÃ“N APLICADA: Tag=%s | PIPoint=%s â†’ EquipoID=%d",
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
						"âŒ Error guardando tag descubierto: Tag=%s | PIPoint=%s | Error=%v",
						reading.TagName,
						reading.PIPointName,
						err,
					)
				} else {
					log.Printf(
						"ðŸ†• Tag sin equipo: Tag=%s | PIPoint=%s",
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
			"âš ï¸ Lectura sin EquipoID despuÃ©s de la resoluciÃ³n: Tag=%s | PIPoint=%s",
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
				"âŒ Error guardando dato: %v",
				err,
			)
		} else {
			log.Printf(
				"ðŸ’¾ Dato guardado: Equipo=%d | Tag=%s | Valor=%.3f | Unidad=%s | Fuente=%s",
				reading.EquipmentID,
				reading.TagName,
				reading.Value,
				reading.Unit,
				reading.Source,
			)

			log.Printf(
				"âœ… Dato GUARDADO: Equipo=%d, %s=%.3f %s",
				reading.EquipmentID,
				reading.TagName,
				reading.Value,
				reading.Unit,
			)
		}

	} else {

		log.Printf(
			"â­ï¸ Dato NO guardado: Equipo=%d, %s=%.3f %s (motivo: %s)",
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
			"âš ï¸ Error actualizando Ãºltimo valor: Equipo=%d | Tag=%s | Error=%v",
			reading.EquipmentID,
			reading.TagName,
			err,
		)
	}
	
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
// Registrar tiempo activo si estÃ¡ configurado
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

// Resolver el activo principal (equipo > componente > repuesto)
activoTipoActual := "equipo"
activoIDActual := 0
if equipoActivoID != nil && *equipoActivoID > 0 {
    activoIDActual = *equipoActivoID
} else if componenteActivoID != nil && *componenteActivoID > 0 {
    activoTipoActual = "componente"
    activoIDActual = *componenteActivoID
} else if repuestoActivoID != nil && *repuestoActivoID > 0 {
    activoTipoActual = "repuesto"
    activoIDActual = *repuestoActivoID
}

if activoIDActual == 0 {
    log.Printf("Sin activo resuelto para tag=%s, se ignora evaluaciÃ³n de umbral", reading.TagName)
    return
}

// Estado actual del activo
estadoActual, err := e.EquipoRepo.ObtenerEstadoActivo(activoTipoActual, activoIDActual)
if err != nil {
    log.Printf("Error consultando estado activo (%s=%d): %v", activoTipoActual, activoIDActual, err)
    return
}
log.Printf("Activo %s=%d estado=%s | valor=%.3f fueraRango=%v",
    activoTipoActual, activoIDActual, estadoActual, reading.Value, fueraDeRango)

claveContador := fmt.Sprintf("%d|%s", tagID, reading.TagName)

e.confirmacionesMu.Lock()
if e.confirmaciones[claveContador] == nil {
    e.confirmaciones[claveContador] = &contadorConfirmacion{}
}
contador := e.confirmaciones[claveContador]
e.confirmacionesMu.Unlock()

if fueraDeRango {
    contador.fueraConsecutivas++
    contador.dentroConsecutivas = 0
} else {
    contador.dentroConsecutivas++
    contador.fueraConsecutivas = 0
}

lecturasConfirmacion := 3
if umbral.LecturasConfirmacion != nil && *umbral.LecturasConfirmacion > 0 {
    lecturasConfirmacion = *umbral.LecturasConfirmacion
}

log.Printf(
    "Confirmacion tag=%s: fuera=%d dentro=%d necesarias=%d",
    reading.TagName,
    contador.fueraConsecutivas,
    contador.dentroConsecutivas,
    lecturasConfirmacion,
)

if fueraDeRango && estadoActual != "fallo" && contador.fueraConsecutivas < lecturasConfirmacion {
    log.Printf(
        "Esperando confirmacion de falla: tag=%s %d/%d",
        reading.TagName,
        contador.fueraConsecutivas,
        lecturasConfirmacion,
    )
    return
}

if !fueraDeRango && estadoActual == "fallo" && contador.dentroConsecutivas < lecturasConfirmacion {
    log.Printf(
        "Esperando confirmacion de recuperacion: tag=%s %d/%d",
        reading.TagName,
        contador.dentroConsecutivas,
        lecturasConfirmacion,
    )
    return
}

if !fueraDeRango {
    // Solo hay transiciÃ³n si estaba en 'fallo' (recuperaciÃ³n)
    if estadoActual == "fallo" {
        log.Printf("ðŸŸ¢ RECUPERACIÃ“N: %s=%d vuelve al rango (valor=%.3f) â†’ 'activo'",
            activoTipoActual, activoIDActual, reading.Value)

        // 1. Cerrar alarmas activas
        _ = e.AlarmaService.CerrarAlarmasActivasPorEquipo(activoIDActual)
        if activoTipoActual != "equipo" {
            // Si es componente o repuesto, cerrar por columna especÃ­fica
            _ = e.cerrarAlarmasActivasPorActivo(activoTipoActual, activoIDActual)
        }

        // 2. Registrar evento de recuperación PRIMERO (mientras el estado es 'fallo')
        if e.EventoService != nil {
            _ = e.EventoService.CambiarEstadoActivo(
                *equipoActivoID, componenteActivoID, repuestoActivoID,
                &tagID, &reading.TagName, "activo",
                fmt.Sprintf("Recuperado: %s = %.3f dentro de rango", reading.TagName, reading.Value),
            )
        }

        // 3. Cambiar estado del activo a activo
        _ = e.EquipoRepo.ActualizarEstadoActivo(activoTipoActual, activoIDActual, "activo")

        // 4. Cerrar fila de tiempo con motivo 'recuperado', abrir 'activo'
        if e.TiempoActivoService != nil && umbral.ContarTiempoActivo {
            e.TiempoActivoService.Transicionar(
                tagID, activoTipoActual, activoIDActual,
                "activo", "recuperado", reading.Value, timestamp,
            )
        }
    } else if estadoActual == "mantenimiento" {
        // Sigue en mantenimiento, no hacemos nada
        log.Printf("Activo %s=%d en mantenimiento, valor dentro de rango â†’ sin cambios",
            activoTipoActual, activoIDActual)
    }
    return
}

if estadoActual == "fallo" {
    // Ya estÃ¡ en fallo, no repetir. Registrar evento silencioso para histÃ³rico.
    evento := &models.DatoEvento{
        EquipoID:        *equipoActivoID,
        ComponenteID:    componenteActivoID,
        RepuestoID:      repuestoActivoID,
        TagID:           &tagID,
        TipoEvento:      "persistencia_fallo",
        Descripcion:     fmt.Sprintf("%s sigue fuera de rango: %.3f", reading.TagName, reading.Value),
        ValorNuevo:      &reading.Value,
        Parametro:       reading.TagName,
        TimestampEvento: timestamp,
    }
    _ = e.DecisionService.ConfigGuardadoRepo.GuardarEvento(evento)
    return
}

// TransiciÃ³n a fallo (desde 'activo' o 'mantenimiento')
motivoTransicion := "activo"
if estadoActual == "mantenimiento" {
    motivoTransicion = "salida_por_falla"
    log.Printf("ðŸ”´ SALIDA DE MANTENIMIENTO: %s=%d valor=%.3f fuera de rango â†’ 'fallo'",
        activoTipoActual, activoIDActual, reading.Value)
} else {
    log.Printf("ðŸ”´ FALLA: %s=%d valor=%.3f fuera de rango â†’ 'fallo'",
        activoTipoActual, activoIDActual, reading.Value)
}

// 1. Guardar evento de alarma
motivo := fmt.Sprintf(
    "%s = %.3f %s (fuera de rango: min=%s max=%s)",
    reading.TagName, reading.Value, reading.Unit,
    fmtFloatPtr(umbral.UmbralMin), fmtFloatPtr(umbral.UmbralMax),
)
eventoAlarma := &models.DatoEvento{
    EquipoID:        *equipoActivoID,
    ComponenteID:    componenteActivoID,
    RepuestoID:      repuestoActivoID,
    TagID:           &tagID,
    TipoEvento:      "alarma",
    Descripcion:     motivo,
    ValorNuevo:      &reading.Value,
    Parametro:       reading.TagName,
    TimestampEvento: timestamp,
}
_ = e.DecisionService.ConfigGuardadoRepo.GuardarEvento(eventoAlarma)

// 2. Registrar cambio en eventos_estado PRIMERO (mientras el estado es 'activo' o 'mantenimiento')
if e.EventoService != nil {
    _ = e.EventoService.CambiarEstadoActivo(
        *equipoActivoID, componenteActivoID, repuestoActivoID,
        &tagID, &reading.TagName, "fallo", motivo,
    )
}

// 3. Cambiar estado del activo a 'fallo'
_ = e.EquipoRepo.ActualizarEstadoActivo(activoTipoActual, activoIDActual, "fallo")

// 4. Crear alarma/evento segÃºn el modo
if umbral.Modo == "alerta" {
    if e.AlertaService != nil {
        e.AlertaService.GenerarAlertaPolimorfica(
            *equipoActivoID, componenteActivoID, repuestoActivoID,
            &tagID, &reading.TagName, &reading.Value,
            umbral.UmbralMin, umbral.UmbralMax, motivo,
        )
    }
} else {
    if e.AlarmaService != nil {
        e.AlarmaService.GenerarAlarmaPolimorfica(
            *equipoActivoID, componenteActivoID, repuestoActivoID,
            &tagID, &reading.TagName, motivo,
        )
    }
}

    // 5. Transicionar tiempo con motivo adecuado
    if e.TiempoActivoService != nil && umbral.ContarTiempoActivo {
        e.TiempoActivoService.Transicionar(
            tagID, activoTipoActual, activoIDActual,
            "fallo", motivoTransicion, reading.Value, timestamp,
        )
    }
}

func (e *RuleEngine) ProcessPingResult(equipoID int, failedAttempts int, maxRetries int) {
	if failedAttempts != maxRetries {
		return
	}

	motivo := fmt.Sprintf("Sin respuesta de ping despuÃ©s de %d intentos", failedAttempts)
	log.Printf("ðŸš¨ Equipo %d cambiÃ³ a FALLO por ping", equipoID)

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

	motivo := fmt.Sprintf("ConexiÃ³n restablecida. Latencia: %.0fms", latency)
	e.EventoService.CambiarEstadoEquipo(equipoID, "activo", motivo)
	e.AlarmaService.CerrarAlarmasActivasPorEquipo(equipoID)

	// Recuperar tambiÃ©n los hijos
	e.EquipoRepo.PropagarEstadoHijos(equipoID, "activo",
		fmt.Sprintf("Padre ID %d recuperado", equipoID))

	e.Dispatcher.Dispatch(equipoID, "recuperacion", "info", motivo)

	log.Printf("ðŸŸ¢ Equipo %d y sus hijos recuperados", equipoID)
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
		"ðŸ§  CachÃ© asignaciÃ³n: Tag=%s | PIPoint=%s â†’ EquipoID=%d",
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
// cerrarAlarmasActivasPorActivo cierra las alarmas activas de un componente/repuesto.
func (e *RuleEngine) cerrarAlarmasActivasPorActivo(tipo string, id int) error {
	var col string
	switch tipo {
	case "componente":
		col = "componente_id"
	case "repuesto":
		col = "repuesto_id"
	default:
		return nil
	}

	_, err := e.DecisionService.ConfigGuardadoRepo.DB.Exec(`
        UPDATE alarmas
        SET estado = 'cerrada', fecha_cierre = NOW()
        WHERE `+col+` = $1 AND estado = 'activa'
    `, id)
	return err
}
