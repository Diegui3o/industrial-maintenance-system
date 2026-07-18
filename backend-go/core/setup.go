// core/setup.go
package core

import (
	"database/sql"
	"log"

	"backend/engine"
	"backend/repository"
	"backend/scheduler"
	"backend/services"
)

func InitScheduler(db *sql.DB) (*scheduler.Scheduler, *engine.RuleEngine) {
	configRepo := repository.NewConfigRepository(db)
	sensorRepo := repository.NewSensorRepository(db)
	alarmaRepo := &repository.AlarmaRepository{DB: db}
	equipoRepo := &repository.EquipoRepository{DB: db}
	eventosRepo := &repository.EventosRepository{DB: db}
	auditoriaRepo := repository.NewAuditoriaRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)
	notifRepo := repository.NewNotificacionRepository(db)

	auditoriaService := services.NewAuditoriaService(auditoriaRepo)
	alarmaService := &services.AlarmaService{Repo: alarmaRepo, EquipoRepo: equipoRepo}
	eventosService := services.NewEventosService(eventosRepo, equipoRepo, auditoriaService, alarmaService)
	dispatcherService := services.NewDispatcherService(notifRepo, equipoRepo)

	notifierService := &services.NotifierService{
		WhatsApp:   nil,
		Email:      nil,
		NotifRepo:  notifRepo,
		GrupoRepo:  whatsappRepo,
		EquipoRepo: equipoRepo,
	}

	ruleEngine := &engine.RuleEngine{
		ConfigRepo:      configRepo,
		SensorRepo:      sensorRepo,
		AlarmaService:   alarmaService,
		EventoService:   eventosService,
		NotifierService: notifierService,
		EquipoRepo:      equipoRepo,
		Dispatcher:      dispatcherService,
	}

	sched := scheduler.NewScheduler(configRepo, ruleEngine)
	log.Println("Scheduler inicializado")

	return sched, ruleEngine
}
