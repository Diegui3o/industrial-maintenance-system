// routes/routes.go
package routes

import (
	"backend/engine"
	"backend/handlers"
	"backend/repository"
	"backend/scheduler"
	"backend/services"
	"database/sql"

	"github.com/gorilla/mux"
)

func SetupRoutes(db *sql.DB, ruleEngine *engine.RuleEngine, sched *scheduler.Scheduler, whatsappManager *services.WhatsAppManager) *mux.Router {
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
	configRepo := repository.NewConfigRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)
	mantenimientoRepo := repository.NewMantenimientoRepository(db)
	conexionRepo := repository.NewConexionRepository(db)

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

	// ============================================
	// HANDLERS
	// ============================================
	equipoHandler := &handlers.EquipoHandler{
		Service:    equipoService,
		ConfigRepo: configRepo,
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
	whatsappHandler := &handlers.WhatsAppHandler{
		Repo:    whatsappRepo,
		Manager: whatsappManager,
		DB:      db,
	}
	sensorHandler := handlers.NewSensorHandler(ruleEngine)
	mantenimientoHandler := &handlers.MantenimientoHandler{Repo: mantenimientoRepo}
	conexionHandler := &handlers.ConexionHandler{Repo: conexionRepo}

	// ============================================
	// RUTAS
	// ============================================
	r.HandleFunc("/api/equipos", equipoHandler.GetEquipos).Methods("GET")
	r.HandleFunc("/api/equipos", equipoHandler.PostEquipos).Methods("POST")
	r.HandleFunc("/api/equipos/criticos", equipoHandler.ListarCriticos).Methods("GET")
	r.HandleFunc("/api/equipos/raices", equipoHandler.GetRaices).Methods("GET")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.GetEquipoPorID).Methods("GET")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.UpdateEquipos).Methods("PUT")

	r.HandleFunc("/api/equipos/{id}/estado", eventosHandler.CambiarEstado).Methods("PUT")
	r.HandleFunc("/api/equipos/{id}/historial", eventosHandler.GetHistorialEquipo).Methods("GET")

	r.HandleFunc("/api/metricas", metricaHandler.CrearMetrica).Methods("POST")

	r.HandleFunc("/api/auditoria", auditoriaHandler.HandleListarAuditoria).Methods("GET")

	r.HandleFunc("/api/usuarios/keys", usuarioHandler.ListarConKeys).Methods("GET")
	r.HandleFunc("/api/usuarios", usuarioHandler.Crear).Methods("POST")
	r.HandleFunc("/api/usuarios", usuarioHandler.Listar).Methods("GET")
	r.HandleFunc("/api/usuarios/{id}", usuarioHandler.ObtenerPorID).Methods("GET")

	r.HandleFunc("/api/alarmas", alarmaHandler.CrearAlarma).Methods("POST")
	r.HandleFunc("/api/alarmas", alarmaHandler.ListarActivas).Methods("GET")
	r.HandleFunc("/api/alarmas/{id}/atender", alarmaHandler.Atender).Methods("PUT")
	r.HandleFunc("/api/alarmas/{id}/cerrar", alarmaHandler.Cerrar).Methods("PUT")
	r.HandleFunc("/api/equipos/{id}/alarmas", alarmaHandler.ListarPorEquipo).Methods("GET")
	r.HandleFunc("/api/dashboard/resumen", dashboardHandler.HandleResumen).Methods("GET")

	r.HandleFunc("/api/dispositivos", dispositivoHandler.ListarTodos).Methods("GET")
	r.HandleFunc("/api/dispositivos", dispositivoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.ObtenerPorID).Methods("GET")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.Actualizar).Methods("PUT")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.Eliminar).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/dispositivos", dispositivoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/dispositivos", dispositivoHandler.ListarPorEquipo).Methods("GET")

	r.HandleFunc("/api/config/umbrales", configHandler.CrearUmbral).Methods("POST")
	r.HandleFunc("/api/config/fuentes", configHandler.ListarFuentes).Methods("GET")
	r.HandleFunc("/api/config/fuentes", configHandler.CrearFuente).Methods("POST")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ObtenerFuente).Methods("GET")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ActualizarFuente).Methods("PUT")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.EliminarFuente).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/fuentes", configHandler.ListarFuentesPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/umbrales", configHandler.ListarUmbrales).Methods("GET")

	// WhatsApp (única sección)
	r.HandleFunc("/api/grupos", whatsappHandler.ListarGrupos).Methods("GET")
	r.HandleFunc("/api/grupos", whatsappHandler.CrearGrupo).Methods("POST")
	r.HandleFunc("/api/grupos/{id}", whatsappHandler.ActualizarGrupo).Methods("PUT")
	r.HandleFunc("/api/grupos/{id}", whatsappHandler.EliminarGrupo).Methods("DELETE")
	r.HandleFunc("/api/grupos/{id}/equipos", whatsappHandler.ListarEquiposPorGrupo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/grupos", whatsappHandler.AsociarGrupo).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/grupos/{grupoId}", whatsappHandler.DesasociarGrupo).Methods("DELETE")
	r.HandleFunc("/api/grupos/{id}/enviar", whatsappHandler.EnviarMensajePrueba).Methods("POST")
	r.HandleFunc("/api/whatsapp/grupos", whatsappHandler.ListarGruposReales).Methods("GET")
	r.HandleFunc("/api/whatsapp/estado_completo", whatsappHandler.EstadoCompleto).Methods("GET")
	r.HandleFunc("/api/whatsapp/qr", whatsappHandler.ObtenerQR).Methods("GET")
	r.HandleFunc("/api/whatsapp/iniciar", whatsappHandler.IniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/reiniciar", whatsappHandler.ReiniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/refresh", whatsappHandler.RefreshBot).Methods("POST")

	r.HandleFunc("/api/v1/eventos/sensor", sensorHandler.RecibirBatch).Methods("POST")
	r.HandleFunc("/api/mantenimiento", mantenimientoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/mantenimiento/{id}", mantenimientoHandler.Obtener).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/mantenimiento", mantenimientoHandler.ListarPorEquipo).Methods("GET")
	diagHandler := &handlers.DiagnosticoHandler{}
	r.HandleFunc("/api/diagnostico", diagHandler.Diagnostico).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.ListarPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.Crear).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/conexiones/{conId}", conexionHandler.Eliminar).Methods("DELETE")

	// Jerarquía
	r.HandleFunc("/api/equipos/{id}/hijos", equipoHandler.GetHijos).Methods("GET")

	return r
}
