// routes/routes.go
package routes

import (
	"backend/engine"
	"backend/handlers"
	"backend/repository"
	"backend/scheduler"
	"backend/services"
	"database/sql"

	"cloud.google.com/go/firestore"
	"github.com/gorilla/mux"
)

func SetupRoutes(
	db *sql.DB,
	ruleEngine *engine.RuleEngine,
	sched *scheduler.Scheduler,
	whatsappManager *services.WhatsAppManager,
	firestoreClient *firestore.Client,
) *mux.Router {
	r := mux.NewRouter()

	// ============================================
	// REPOSITORIES
	// ============================================
	equipoRepo := &repository.EquipoRepository{DB: db}
	metricaRepo := &repository.MetricaRepository{DB: db}
	auditoriaRepo := repository.NewAuditoriaRepository(db)
	alarmaRepo := &repository.AlarmaRepository{DB: db}
	usuarioRepo := &repository.UsuarioRepository{DB: db}
	dashboardRepo := &repository.DashboardRepository{DB: db}
	dispositivoRepo := &repository.DispositivoRedRepository{DB: db}
	eventosRepo := &repository.EventosRepository{DB: db}
	configRepo := repository.NewConfigRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)
	mantenimientoRepo := repository.NewMantenimientoRepository(db)
	mantenimientoDetalleRepo := repository.NewMantenimientoDetalleRepository(db)

	mantenimientoOperacionRepo := repository.NewMantenimientoOperacionRepository(db)
	conexionRepo := repository.NewConexionRepository(db)
	firestoreRepo := repository.NewFirestoreRepository(
		firestoreClient,
	)
	sensorRepo := repository.NewSensorRepository(db)
	tipoEquipoRepo := repository.NewTipoEquipoRepository(db)
	piTagRepo := repository.NewPITagRepository(db)
	tagDescubiertoRepo := repository.NewTagDescubiertoRepository(db)
	estructuraPlantaRepo := repository.NewEstructuraPlantaRepository(db)
	tiempoActivoRepo := repository.NewTiempoActivoRepository(db)
	alertaRepo := repository.NewAlertaRepository(db)

	// ============================================
	// SERVICES
	// ============================================
	auditoriaService := services.NewAuditoriaService(auditoriaRepo)
	alarmaService := &services.AlarmaService{Repo: alarmaRepo, EquipoRepo: equipoRepo}
	equipoService := &services.EquipoService{Repo: equipoRepo}
	metricaService := &services.MetricaService{Repo: metricaRepo}
	usuarioService := &services.UsuarioService{Repo: usuarioRepo}
	dashboardService := &services.DashboardService{Repo: dashboardRepo}
	dispositivoService := &services.DispositivoRedService{Repo: dispositivoRepo}
	firestoreService := services.NewFirestoreService(
		firestoreRepo,
	)
	tipoEquipoService := services.NewTipoEquipoService(
		tipoEquipoRepo,
	)
	piTagService := services.NewPITagService(piTagRepo, equipoRepo)
	estructuraPlantaService := services.NewEstructuraPlantaService(estructuraPlantaRepo)
	tiempoActivoSvc := services.NewTiempoActivoService(tiempoActivoRepo)
	alertaHandler := handlers.NewAlertaHandler(alertaRepo)

	// ============================================
	// HANDLERS
	// ============================================
	equipoHandler := &handlers.EquipoHandler{
		Service:            equipoService,
		ConfigRepo:         configRepo,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
	eventosHandler := &handlers.EventosHandler{Service: ruleEngine.EventoService}
	metricaHandler := &handlers.MetricaHandler{Service: metricaService}
	auditoriaHandler := handlers.NewAuditoriaHandler(auditoriaService)
	usuarioHandler := &handlers.UsuarioHandler{Service: usuarioService}
	alarmaHandler := &handlers.AlarmaHandler{Service: alarmaService}
	dashboardHandler := &handlers.DashboardHandler{Service: dashboardService}
	dispositivoHandler := &handlers.DispositivoRedHandler{Service: dispositivoService}
	configHandler := &handlers.ConfigHandler{
		Repo:      configRepo,
		Scheduler: sched,
	}
	activoService := services.NewActivoService(
		equipoRepo,
		alarmaRepo,
		repository.NewAlertaRepository(db),
		eventosRepo,
		repository.NewTiempoActivoRepository(db),
	)
	activoHandler := handlers.NewActivoHandler(activoService)
	whatsappHandler := &handlers.WhatsAppHandler{
		Repo:    whatsappRepo,
		Manager: whatsappManager,
		DB:      db,
	}
	tiempoRealHandler := handlers.NewTiempoRealHandler(sensorRepo)
	sensorHandler := handlers.NewSensorHandler(ruleEngine)

	mantenimientoHandler := &handlers.MantenimientoHandler{
		Repo: mantenimientoRepo,
	}
	mantenimientoDetalleHandler := handlers.NewMantenimientoDetalleHandler(
		mantenimientoDetalleRepo,
	)
	mantenimientoOperacionHandler := handlers.NewMantenimientoOperacionHandler(
		mantenimientoOperacionRepo,
	)
	conexionHandler := &handlers.ConexionHandler{Repo: conexionRepo}
	firestoreHandler := handlers.NewFirestoreHandler(
		firestoreService,
	)
	tipoEquipoHandler := handlers.NewTipoEquipoHandler(
		tipoEquipoService,
	)
	piTagHandler := handlers.NewPITagHandler(piTagRepo, piTagService, tagDescubiertoRepo)
	tagDescubiertoHandler := handlers.NewTagDescubiertoHandler(tagDescubiertoRepo)
	equipoTagHandler := handlers.NewEquipoTagHandler(tagDescubiertoRepo)
	estructuraPlantaHandler := handlers.NewEstructuraPlantaHandler(
		estructuraPlantaService,
		db,
	)
	tiempoActivoHandler := handlers.NewTiempoActivoHandler(tiempoActivoSvc)

	// ============================================
	// EQUIPOS
	// ============================================

	registrarEquiposRoutes(
		r,
		equipoHandler,
		eventosHandler,
	)

	// ============================================
	// METRICAS
	// ============================================

	registrarMetricasRoutes(
		r,
		metricaHandler,
	)

	// ============================================
	// AUDITORIA
	// ============================================

	registrarAuditoriaRoutes(
		r,
		auditoriaHandler,
	)

	// ============================================
	// USUARIOS
	// ============================================

	registrarUsuariosRoutes(
		r,
		usuarioHandler,
	)

	// ============================================
	// ALARMAS
	// ============================================

	registrarAlarmasRoutes(
		r,
		alarmaHandler,
	)

	// ============================================
	// DASHBOARD
	// ============================================

	registrarDashboardRoutes(
		r,
		dashboardHandler,
	)

	// ============================================
	// DISPOSITIVOS
	// ============================================

	registrarDispositivosRoutes(
		r,
		dispositivoHandler,
	)

	// ============================================
	// CONFIGURACION
	// ============================================

	registrarConfiguracionRoutes(
		r,
		configHandler,
	)
	
	registrarAlertasRoutes(
		r,
		alertaHandler,
	)

	// ============================================
	// WHATSAPP
	// ============================================

	registrarWhatsappRoutes(
		r,
		whatsappHandler,
	)

	// ============================================
	// TIEMPO REAL
	// ============================================

	registrarTiempoRealRoutes(
		r,
		tiempoRealHandler,
	)

	// ============================================
	// PI / TAGS
	// ============================================

	registrarPIRoutes(
		r,
		piTagHandler,
		tagDescubiertoHandler,
		equipoTagHandler,
		tiempoActivoHandler,
	)
	// ============================================
	// FIRESTORE
	// ============================================

	registrarFirestoreRoutes(
		r,
		firestoreHandler,
	)

	// ============================================
	// SENSORES
	// ============================================

	registrarSensorRoutes(
		r,
		sensorHandler,
	)

	// ============================================
	// DIAGNÓSTICO
	// ============================================

	diagHandler := &handlers.DiagnosticoHandler{}
	registrarDiagnosticoRoutes(
		r,
		diagHandler,
	)

	// ============================================
	// CONEXIONES
	// ============================================

	registrarConexionesRoutes(
		r,
		conexionHandler,
	)
	registrarActivosRoutes(
		r,
		activoHandler,
	)
	// ============================================
	// ============================================
	// ESTRUCTURA PLANTA
	// ============================================

	registrarPlantaRoutes(
		r,
		estructuraPlantaHandler,
		tipoEquipoHandler,
	)
	// ============================================
	// MANTENIMIENTO
	// ============================================

	registrarMantenimientoRoutes(
		r,
		mantenimientoHandler,
		mantenimientoDetalleHandler,
		mantenimientoOperacionHandler,
	)

	return r
}
