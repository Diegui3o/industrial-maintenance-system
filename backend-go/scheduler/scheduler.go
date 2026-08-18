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
		reloadChan:        make(chan bool),
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
		// Leer fuentes SIEMPRE desde la base de datos (sin caché)
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

			intervalo := time.Duration(fuente.IntervaloSegundos) * time.Second
			if s.RecoveryMode[equipoID] {
				intervalo = 10 * time.Second
			}

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

			if !success {
				s.RuleEngine.ProcessPingResult(equipoID, s.PingState[equipoID], totalIntentos)
				s.RecoveryMode[equipoID] = true
				s.RecoverySuccesses[equipoID] = 0
			} else {
				if s.RecoveryMode[equipoID] {
					s.RecoverySuccesses[equipoID]++
					if s.RecoverySuccesses[equipoID] >= 2 {
						s.RecoveryMode[equipoID] = false
						s.RecoverySuccesses[equipoID] = 0
						s.RuleEngine.ProcessPingRecovery(equipoID, 0)
						log.Printf("✅ Equipo %d recuperado tras monitoreo adaptativo", equipoID)
					}
				} else {
					s.RuleEngine.ProcessPingRecovery(equipoID, 0)
				}
			}

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
