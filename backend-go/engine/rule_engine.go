package engine

import (
	"fmt"
	"log"

	"backend/repository"
	"backend/services"
)

type RuleEngine struct {
	ConfigRepo      *repository.ConfigRepository
	SensorRepo      *repository.SensorRepository
	AlarmaService   *services.AlarmaService
	EventoService   *services.EventosService
	NotifierService *services.NotifierService
	EquipoRepo      *repository.EquipoRepository
	Dispatcher      *services.DispatcherService
}

func (e *RuleEngine) ProcessSensorData(
	equipoID int,
	parametro string,
	valor float64,
	unidad string,
	fuente string,
) {

	e.SensorRepo.GuardarDato(equipoID, parametro, valor, unidad, fuente)

	umbrales, err := e.ConfigRepo.ObtenerUmbrales(equipoID, parametro)
	if err != nil || umbrales == nil {
		return
	}
	evaluator := &ConditionEvaluator{}
	estado, excedido := evaluator.Evaluate(umbrales.UmbralMin, umbrales.UmbralMax, valor)

	if !excedido {
		return
	}

	motivo := fmt.Sprintf("%s %s: %.2f %s (límite: %.2f %s)",
		parametro, estado, valor, unidad, *umbrales.UmbralMax, unidad)

	err = e.EventoService.CambiarEstadoEquipo(equipoID, "fallo", motivo)
	if err != nil {
		log.Printf("Error cambiando estado: %v", err)
		return
	}

	e.NotifierService.NotificarFalloEquipo(equipoID, motivo, umbrales.Severidad)
	e.Dispatcher.Dispatch(equipoID, "fallo", umbrales.Severidad, motivo)
	log.Printf("🚨 Equipo %d en FALLO por %s", equipoID, parametro)
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
