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

func InitScheduler(db *sql.DB) (*scheduler.Scheduler, *engine.RuleEngine, *services.WhatsAppManager) {
	configRepo := repository.NewConfigRepository(db)
	sensorRepo := repository.NewSensorRepository(db)
	alarmaRepo := &repository.AlarmaRepository{DB: db}
	equipoRepo := &repository.EquipoRepository{DB: db}
	eventosRepo := &repository.EventosRepository{DB: db}
	auditoriaRepo := repository.NewAuditoriaRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)
	notifRepo := repository.NewNotificacionRepository(db)
	configGuardadoRepo := repository.NewConfigGuardadoRepository(db)
	tagDescubiertoRepo := repository.NewTagDescubiertoRepository(db)

	// Crear manager de WhatsApp (multi‑instancia)
	whatsappManager := services.NewWhatsAppManager(db, whatsappRepo)
	whatsappManager.CargarInstancias()

	// Servicios base
	auditoriaService := services.NewAuditoriaService(auditoriaRepo)
	alarmaService := &services.AlarmaService{Repo: alarmaRepo, EquipoRepo: equipoRepo}
	dispatcherService := services.NewDispatcherService(notifRepo, equipoRepo)
	decisionService := services.NewDecisionService(configGuardadoRepo, sensorRepo)

	notifierService := &services.NotifierService{
		WhatsApp:   nil,
		Email:      nil,
		NotifRepo:  notifRepo,
		GrupoRepo:  whatsappRepo,
		EquipoRepo: equipoRepo,
	}

	// Servicio de notificación que recorre todos los clientes del manager
	whatsappNotificationService := services.NewWhatsAppNotificationServiceConManager(
		whatsappManager,
		whatsappRepo,
		equipoRepo,
	)
	eventosService := services.NewEventosService(
		eventosRepo,
		equipoRepo,
		auditoriaService,
		alarmaService,
		whatsappNotificationService,
	)

	ruleEngine := engine.NewRuleEngine(
		configRepo,
		sensorRepo,
		decisionService,
		alarmaService,
		eventosService,
		notifierService,
		equipoRepo,
		dispatcherService,
		tagDescubiertoRepo,
	)

	// ============================================
	// SCHEDULER
	// ============================================
	sched := scheduler.NewScheduler(configRepo, ruleEngine)
	log.Println("Scheduler inicializado")

	return sched, ruleEngine, whatsappManager
}
