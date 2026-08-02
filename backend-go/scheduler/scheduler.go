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

	// Estados de ping
	PingState         map[int]int // fallos consecutivos actuales
	RecoveryMode      map[int]bool
	RecoverySuccesses map[int]int // cuántos pings exitosos seguidos en modo recuperación
}

func NewScheduler(configRepo *repository.ConfigRepository, ruleEngine *engine.RuleEngine) *Scheduler {
	return &Scheduler{
		ConfigRepo:        configRepo,
		RuleEngine:        ruleEngine,
		PingState:         make(map[int]int),
		RecoveryMode:      make(map[int]bool),
		RecoverySuccesses: make(map[int]int),
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

		for _, fuente := range fuentes {
			equipoID := fuente.EquipoID

			// Saltar equipos en mantenimiento o inactivos
			estado, _ := s.RuleEngine.EquipoRepo.ObtenerEstadoActualEquipo(equipoID)
			if estado == "inactivo" || estado == "mantenimiento" {
				continue
			}

			// Determinar el intervalo a usar
			intervalo := time.Duration(fuente.IntervaloSegundos) * time.Second
			if s.RecoveryMode[equipoID] {
				// En modo recuperación usamos un intervalo corto fijo (10 s)
				intervalo = 10 * time.Second
			}

			// Ráfaga de pings (intento inicial + reintentos)
			totalIntentos := fuente.Reintentos + 1
			success := false
			for intento := 0; intento < totalIntentos; intento++ {
				ok, latency := collectors.PingWithRetries(
					fuente.Endpoint,
					time.Duration(fuente.TimeoutSegundos)*time.Second,
					1, // un solo intento por ping
				)
				if ok {
					log.Printf("🟢 PING OK | Equipo %d | IP: %s | Latencia: %.0fms (intento %d/%d)",
						equipoID, fuente.Endpoint, latency, intento+1, totalIntentos)
					s.PingState[equipoID] = 0
					success = true
					break
				} else {
					log.Printf("🔴 PING FALLO | Equipo %d | IP: %s | Intento %d/%d",
						equipoID, fuente.Endpoint, intento+1, totalIntentos)
					s.PingState[equipoID]++
					if intento < totalIntentos-1 {
						time.Sleep(2 * time.Second) // breve pausa entre intentos de la ráfaga
					}
				}
			}

			// Evaluar resultado de la ráfaga
			if !success {
				// Todos los intentos fallaron → fallo confirmado
				s.RuleEngine.ProcessPingResult(equipoID, s.PingState[equipoID], totalIntentos)
				// Activar modo recuperación
				s.RecoveryMode[equipoID] = true
				s.RecoverySuccesses[equipoID] = 0
			} else {
				// Al menos un ping exitoso
				if s.RecoveryMode[equipoID] {
					// Estamos en modo recuperación
					s.RecoverySuccesses[equipoID]++
					if s.RecoverySuccesses[equipoID] >= 2 {
						// Dos éxitos seguidos → equipo recuperado
						s.RecoveryMode[equipoID] = false
						s.RecoverySuccesses[equipoID] = 0
						// Notificar recuperación al engine (cambia estado a "activo", cierra alarmas, etc.)
						s.RuleEngine.ProcessPingRecovery(equipoID, 0)
						log.Printf("✅ Equipo %d recuperado tras monitoreo adaptativo", equipoID)
					}
				} else {
					// No estaba en fallo, operación normal
					s.RuleEngine.ProcessPingRecovery(equipoID, 0)
				}
			}

			// Esperar el intervalo correspondiente (normal o corto)
			time.Sleep(intervalo)
		}
	}
}

func (s *Scheduler) piSystemLoop() {
	// ... sin cambios
	for {
		fuentes, err := s.ConfigRepo.ObtenerFuentesActivas("pisystem")
		if err != nil {
			time.Sleep(30 * time.Second)
			continue
		}
		for _, fuente := range fuentes {
			_ = fuente
		}
		time.Sleep(60 * time.Second)
	}
}
