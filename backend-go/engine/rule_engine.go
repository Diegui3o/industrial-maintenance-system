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
}

func (e *RuleEngine) ProcessSensorData(equipoID int, parametro string, valor float64, unidad string) {

	e.SensorRepo.GuardarDato(equipoID, parametro, valor, unidad, "sensor")

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
	}
}
func (e *RuleEngine) ProcessPingRecovery(equipoID int, latency float64) {
	equipo, _ := e.EquipoRepo.ObtenerEquipoPorID(equipoID)

	if equipo.EstadoEquipo != "fallo" {
		return
	}

	motivo := fmt.Sprintf("Conexión restablecida. Latencia: %.0fms", latency)
	e.EventoService.CambiarEstadoEquipo(equipoID, "activo", motivo)
	e.AlarmaService.CerrarAlarmasActivasPorEquipo(equipoID)
	log.Printf("🟢 Equipo %d recuperado", equipoID)
}
