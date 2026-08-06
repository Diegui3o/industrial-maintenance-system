// core/setup.go
package core

import (
	"database/sql"
	"log"

	"backend/engine"
	"backend/notifiers"
	"backend/repository"
	"backend/scheduler"
	"backend/services"
	"backend/whatsapp"
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

	// Crear cliente de WhatsApp una sola vez
	whatsappClient := whatsapp.NewWhatsAppClient()

	// Servicios base
	auditoriaService := services.NewAuditoriaService(auditoriaRepo)
	alarmaService := &services.AlarmaService{Repo: alarmaRepo, EquipoRepo: equipoRepo}
	dispatcherService := services.NewDispatcherService(notifRepo, equipoRepo)

	// Notificaciones existentes (por ahora sin WhatsApp directo)
	notifierService := &services.NotifierService{
		WhatsApp:   nil,
		Email:      nil,
		NotifRepo:  notifRepo,
		GrupoRepo:  whatsappRepo,
		EquipoRepo: equipoRepo,
	}

	// Crear el notificador de WhatsApp basado en el cliente
	whatsappNotifier := notifiers.NewWhatsAppNotifier(whatsappClient)

	// Crear el servicio de notificación de WhatsApp que usará EventosService
	whatsappNotificationService := services.NewWhatsAppNotificationService(
		whatsappNotifier,
		whatsappRepo,
		equipoRepo,
	)

	// EventosService con la inyección del nuevo servicio
	eventosService := services.NewEventosService(
		eventosRepo,
		equipoRepo,
		auditoriaService,
		alarmaService,
		whatsappNotificationService,
	)

	// RuleEngine con el EventosService correcto
	ruleEngine := &engine.RuleEngine{
		ConfigRepo:      configRepo,
		SensorRepo:      sensorRepo,
		AlarmaService:   alarmaService,
		EventoService:   eventosService,
		NotifierService: notifierService,
		EquipoRepo:      equipoRepo,
		Dispatcher:      dispatcherService,
	}

	// Iniciar el bot de WhatsApp en segundo plano
	go func() {
		log.Println("🤖 Iniciando bot de WhatsApp...")
		sessionPath := "/app/whatsapp_sessions/session.db"
		err := whatsappClient.Connect(sessionPath)
		if err != nil {
			log.Printf("⚠️ Error conectando WhatsApp: %v", err)
			log.Println("💡 El QR se generó en: whatsapp_qr.png")
		} else {
			log.Println("✅ Bot de WhatsApp conectado")
		}
	}()

	sched := scheduler.NewScheduler(configRepo, ruleEngine)
	log.Println("Scheduler inicializado")

	return sched, ruleEngine
}
