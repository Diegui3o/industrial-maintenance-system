package scheduler

import (
	"log"
	"time"

	"backend/collectors"
	"backend/engine"
	"backend/repository"
)

type Scheduler struct {
	ConfigRepo *repository.ConfigRepository
	RuleEngine *engine.RuleEngine
	PingState  map[int]int
}

func NewScheduler(configRepo *repository.ConfigRepository, ruleEngine *engine.RuleEngine) *Scheduler {
	return &Scheduler{
		ConfigRepo: configRepo,
		RuleEngine: ruleEngine,
		PingState:  make(map[int]int),
	}
}

func (s *Scheduler) Start() {
	log.Println("Scheduler iniciado")

	go s.pingLoop()
	go s.piSystemLoop()

	select {}
}
func (s *Scheduler) pingLoop() {
	for {
		fuentes, err := s.ConfigRepo.ObtenerFuentesActivas("ping")
		if err != nil {
			log.Printf("❌ Error obteniendo fuentes ping: %v", err)
			time.Sleep(30 * time.Second)
			continue
		}

		if len(fuentes) == 0 {
			time.Sleep(30 * time.Second)
			continue
		}

		for _, fuente := range fuentes {
			estado, err := s.ConfigRepo.ObtenerEstadoEquipo(fuente.EquipoID)
			if err == nil && (estado == "inactivo" || estado == "mantenimiento") {
				continue
			}

			success, latency := collectors.PingWithRetries(
				fuente.Endpoint,
				time.Duration(fuente.TimeoutSegundos)*time.Second,
				fuente.Reintentos,
			)

			if success {
				log.Printf("🟢 PING OK | Equipo %d | IP: %s | Latencia: %.0fms",
					fuente.EquipoID, fuente.Endpoint, latency)
				s.PingState[fuente.EquipoID] = 0

				s.RuleEngine.ProcessPingRecovery(fuente.EquipoID, latency)

				s.RuleEngine.SensorRepo.GuardarDato(
					fuente.EquipoID,
					"latencia_ping",
					latency,
					"ms",
					"ping",
				)
			} else {
				s.PingState[fuente.EquipoID]++
				log.Printf("🔴 PING FALLO | Equipo %d | IP: %s | Intentos fallidos: %d/%d",
					fuente.EquipoID, fuente.Endpoint, s.PingState[fuente.EquipoID], fuente.Reintentos*2)

				s.RuleEngine.ProcessPingResult(
					fuente.EquipoID,
					s.PingState[fuente.EquipoID],
					fuente.Reintentos*2,
				)
			}

			time.Sleep(time.Duration(fuente.IntervaloSegundos) * time.Second)
		}
	}
}

func (s *Scheduler) piSystemLoop() {
	for {
		fuentes, err := s.ConfigRepo.ObtenerFuentesActivas("pisystem")
		if err != nil {
			time.Sleep(30 * time.Second)
			continue
		}

		for _, fuente := range fuentes {
			// PI System requiere configuración adicional
			// Pendiente de implementar según API específica
			_ = fuente
		}

		time.Sleep(60 * time.Second)
	}
}
