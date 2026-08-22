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

	PingState         map[int]int
	RecoveryMode      map[int]bool
	RecoverySuccesses map[int]int
	reloadChan        chan bool
	intervaloActual   map[int]time.Duration
}

func (s *Scheduler) RecargarFuentes() {
	s.reloadChan <- true
}

func NewScheduler(configRepo *repository.ConfigRepository, ruleEngine *engine.RuleEngine) *Scheduler {
	return &Scheduler{
		ConfigRepo:        configRepo,
		RuleEngine:        ruleEngine,
		PingState:         make(map[int]int),
		RecoveryMode:      make(map[int]bool),
		RecoverySuccesses: make(map[int]int),
		reloadChan:        make(chan bool, 1),
		intervaloActual:   make(map[int]time.Duration),
	}
}

func (s *Scheduler) Start() {
	log.Println("Scheduler iniciado")
	go s.pingLoop()
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

			estado, _ := s.RuleEngine.EquipoRepo.ObtenerEstadoActualEquipo(equipoID)
			if estado == "inactivo" || estado == "mantenimiento" {
				continue
			}

			// Intervalo actual (si no existe, usar el configurado)
			intervalo, existe := s.intervaloActual[equipoID]
			if !existe {
				intervalo = time.Duration(fuente.IntervaloSegundos) * time.Second
				s.intervaloActual[equipoID] = intervalo
			}

			// Realizar ráfaga de pings
			totalIntentos := fuente.Reintentos + 1
			success := false
			for intento := 0; intento < totalIntentos; intento++ {
				ok, latency := collectors.PingWithRetries(
					fuente.Endpoint,
					time.Duration(fuente.TimeoutSegundos)*time.Second,
					1,
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
						time.Sleep(2 * time.Second)
					}
				}
			}

			// Evaluar resultado
			if !success {
				// Confirmar fallo
				s.RuleEngine.ProcessPingResult(equipoID, s.PingState[equipoID], totalIntentos)
				// Activar modo recuperación con intervalo corto
				s.RecoveryMode[equipoID] = true
				s.RecoverySuccesses[equipoID] = 0
				s.intervaloActual[equipoID] = 10 * time.Second
			} else {
				if s.RecoveryMode[equipoID] {
					// En recuperación, aumentar backoff
					s.RecoverySuccesses[equipoID]++
					if s.RecoverySuccesses[equipoID] >= 3 {
						// Tres éxitos consecutivos: declarar recuperado
						s.RecoveryMode[equipoID] = false
						s.RecoverySuccesses[equipoID] = 0
						s.intervaloActual[equipoID] = time.Duration(fuente.IntervaloSegundos) * time.Second
						s.RuleEngine.ProcessPingRecovery(equipoID, 0)
						log.Printf("✅ Equipo %d recuperado tras backoff", equipoID)
					} else {
						// Duplicar intervalo (máximo el configurado)
						s.intervaloActual[equipoID] *= 2
						maxIntervalo := time.Duration(fuente.IntervaloSegundos) * time.Second
						if s.intervaloActual[equipoID] > maxIntervalo {
							s.intervaloActual[equipoID] = maxIntervalo
						}
					}
				} else {
					// Operación normal
					s.RuleEngine.ProcessPingRecovery(equipoID, 0)
				}
			}

			time.Sleep(s.intervaloActual[equipoID])
		}
	}
}
