// routes/routes.go
package routes

import (
	"backend/engine"
	"backend/handlers"
	"backend/repository"
	"backend/services"
	"database/sql"

	"github.com/gorilla/mux"
)

func SetupRoutes(db *sql.DB, ruleEngine *engine.RuleEngine) *mux.Router {

	r := mux.NewRouter()

	equipoRepo := &repository.EquipoRepository{DB: db}
	eventosRepo := &repository.EventosRepository{DB: db}
	metricaRepo := &repository.MetricaRepository{DB: db}
	auditoriaRepo := repository.NewAuditoriaRepository(db)
	alarmaRepo := &repository.AlarmaRepository{DB: db}
	usuarioRepo := &repository.UsuarioRepository{DB: db}
	dashboardRepo := &repository.DashboardRepository{DB: db}
	dispositivoRepo := &repository.DispositivoRedRepository{DB: db}
	configRepo := repository.NewConfigRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)

	auditoriaService := services.NewAuditoriaService(auditoriaRepo)
	alarmaService := &services.AlarmaService{Repo: alarmaRepo, EquipoRepo: equipoRepo}
	equipoService := &services.EquipoService{Repo: equipoRepo}
	eventosService := services.NewEventosService(eventosRepo, equipoRepo, auditoriaService, alarmaService)
	metricaService := &services.MetricaService{Repo: metricaRepo}
	usuarioService := &services.UsuarioService{Repo: usuarioRepo}
	dashboardService := &services.DashboardService{Repo: dashboardRepo}
	dispositivoService := &services.DispositivoRedService{Repo: dispositivoRepo}
	equipoHandler := &handlers.EquipoHandler{Service: equipoService}
	eventosHandler := &handlers.EventosHandler{Service: eventosService}
	metricaHandler := &handlers.MetricaHandler{Service: metricaService}
	auditoriaHandler := handlers.NewAuditoriaHandler(auditoriaService)
	usuarioHandler := &handlers.UsuarioHandler{Service: usuarioService}
	alarmaHandler := &handlers.AlarmaHandler{Service: alarmaService}
	dashboardHandler := &handlers.DashboardHandler{Service: dashboardService}
	dispositivoHandler := &handlers.DispositivoRedHandler{Service: dispositivoService}
	configHandler := &handlers.ConfigHandler{Repo: configRepo}
	whatsappHandler := &handlers.WhatsAppHandler{Repo: whatsappRepo}
	sensorHandler := handlers.NewSensorHandler(ruleEngine)

	r.HandleFunc("/api/equipos", equipoHandler.GetEquipos).Methods("GET")
	r.HandleFunc("/api/equipos", equipoHandler.PostEquipos).Methods("POST")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.GetEquipoPorID).Methods("GET")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.UpdateEquipos).Methods("PUT")

	r.HandleFunc("/api/equipos/{id}/estado", eventosHandler.CambiarEstado).Methods("PUT")
	r.HandleFunc("/api/equipos/{id}/historial", eventosHandler.GetHistorialEquipo).Methods("GET")

	r.HandleFunc("/api/metricas", metricaHandler.CrearMetrica).Methods("POST")

	r.HandleFunc("/api/auditoria", auditoriaHandler.HandleListarAuditoria).Methods("GET")

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
	r.HandleFunc("/api/equipos/{id}/dispositivos", dispositivoHandler.ListarPorEquipo).Methods("GET")

	r.HandleFunc("/api/config/umbrales", configHandler.CrearUmbral).Methods("POST")
	r.HandleFunc("/api/config/fuentes", configHandler.ListarFuentes).Methods("GET")
	r.HandleFunc("/api/config/fuentes", configHandler.CrearFuente).Methods("POST")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ObtenerFuente).Methods("GET")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ActualizarFuente).Methods("PUT")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.EliminarFuente).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/fuentes", configHandler.ListarFuentesPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/umbrales", configHandler.ListarUmbrales).Methods("GET")

	r.HandleFunc("/api/grupos", whatsappHandler.ListarGrupos).Methods("GET")
	r.HandleFunc("/api/grupos", whatsappHandler.CrearGrupo).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/grupos", whatsappHandler.AsociarGrupo).Methods("POST")
	r.HandleFunc("/api/v1/eventos/sensor", sensorHandler.RecibirBatch).Methods("POST")

	return r
}
