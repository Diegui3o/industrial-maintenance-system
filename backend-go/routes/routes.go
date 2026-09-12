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
	configRepo := repository.NewConfigRepository(db)
	whatsappRepo := repository.NewWhatsAppRepository(db)
	mantenimientoRepo := repository.NewMantenimientoRepository(db)
	conexionRepo := repository.NewConexionRepository(db)
	firestoreRepo := repository.NewFirestoreRepository(
		firestoreClient,
	)
	sensorRepo := repository.NewSensorRepository(db)
	tipoEquipoRepo := repository.NewTipoEquipoRepository(db)
	piTagRepo := repository.NewPITagRepository(db)
	tagDescubiertoRepo := repository.NewTagDescubiertoRepository(db)
	estructuraPlantaRepo := repository.NewEstructuraPlantaRepository(db)

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
	)

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
	r.HandleFunc("/api/equipos/{id}/grupos", whatsappHandler.ListarGruposPorEquipo).Methods("GET")
	r.HandleFunc("/api/grupos/{id}/enviar", whatsappHandler.EnviarMensajePrueba).Methods("POST")
	r.HandleFunc("/api/whatsapp/grupos", whatsappHandler.ListarGruposReales).Methods("GET")
	r.HandleFunc("/api/whatsapp/estado_completo", whatsappHandler.EstadoCompleto).Methods("GET")
	r.HandleFunc("/api/whatsapp/qr", whatsappHandler.ObtenerQR).Methods("GET")
	r.HandleFunc("/api/whatsapp/iniciar", whatsappHandler.IniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/reiniciar", whatsappHandler.ReiniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/refresh", whatsappHandler.RefreshBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/asegurar-instancia", whatsappHandler.AsegurarInstancia).Methods("POST")

	r.HandleFunc("/equipos/{id}/tiempo-real", tiempoRealHandler.GetUltimosValores).Methods("GET")
	r.HandleFunc("/equipos/{id}/tiempo-real/{parametro}", tiempoRealHandler.GetUltimoValor).Methods("GET")
	r.HandleFunc("/equipos/{id}/historico/{parametro}", tiempoRealHandler.GetHistoricoTag).Methods("GET")
	r.HandleFunc("/equipos/{id}/tags", tiempoRealHandler.GetTagsByEquipo).Methods("GET")
	r.HandleFunc("/api/pi/tags/sin-equipo", piTagHandler.GetTagsSinEquipo).Methods("GET")
	r.HandleFunc("/api/pi/tags/sugerencias", piTagHandler.GetSugerenciasAgrupacion).Methods("GET")
	r.HandleFunc("/api/pi/tags/asignar", piTagHandler.AsignarTagsEquipo).Methods("POST")
	r.HandleFunc("/api/pi/tags/crear-equipo", piTagHandler.CrearEquipoConTags).Methods("POST")
	r.HandleFunc("/api/pi/tags/equipo/{id}", piTagHandler.GetTagsByEquipo).Methods("GET")
	r.HandleFunc("/api/pi/fuentes", piTagHandler.GetFuentesDisponibles).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/tags", equipoTagHandler.GetTagsByEquipo).Methods("GET")

	r.HandleFunc("/api/pi/tags/descubiertos", tagDescubiertoHandler.GetTagsDescubiertos).Methods("GET")
	r.HandleFunc("/api/pi/tags/descubiertos/{id}", tagDescubiertoHandler.GetTagDescubierto).Methods("GET")
	r.HandleFunc("/api/pi/tags/descubiertos/{id}", tagDescubiertoHandler.EliminarTag).Methods("DELETE")
	r.HandleFunc("/api/pi/tags/asignar", tagDescubiertoHandler.AsignarTag).Methods("POST")
	r.HandleFunc("/api/pi/tags/asignar-multiple", tagDescubiertoHandler.AsignarMultiplesTags).Methods("POST")
	r.HandleFunc("/api/pi/tags/agrupados", piTagHandler.GetTagsAgrupados).Methods("GET")
	r.HandleFunc("/api/equipos/crear-con-tags", equipoHandler.CrearEquipoConTags).Methods("POST")
	r.HandleFunc("/api/pi/tags/jerarquia", piTagHandler.GetTagsJerarquia).Methods("GET")
	r.HandleFunc("/api/pi/tags/estructura", piTagHandler.GetEstructuraTags).Methods("GET")
	r.HandleFunc("/api/pi/tags/valor", piTagHandler.GetTagValor).Methods("GET")

	r.HandleFunc("/api/incidentes", firestoreHandler.ListIncidentes).Methods("GET")
	r.HandleFunc("/api/requerimientos", firestoreHandler.ListarRequerimientos).Methods("GET")
	r.HandleFunc("/api/firestore/{collection}", firestoreHandler.CrearDocumento).Methods("POST")
	r.HandleFunc("/api/firestore/{collection}/{id}", firestoreHandler.ActualizarDocumento).Methods("PUT")
	r.HandleFunc("/api/firestore/{collection}/{id}", firestoreHandler.EliminarDocumento).Methods("DELETE")
	r.HandleFunc("/api/v1/eventos/sensor", sensorHandler.RecibirBatch).Methods("POST")
	r.HandleFunc("/api/mantenimiento", mantenimientoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/mantenimiento/{id}", mantenimientoHandler.Obtener).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/mantenimiento", mantenimientoHandler.ListarPorEquipo).Methods("GET")
	r.HandleFunc("/api/mantenimiento/{id}", mantenimientoHandler.Actualizar).Methods("PUT")
	diagHandler := &handlers.DiagnosticoHandler{}
	r.HandleFunc("/api/diagnostico", diagHandler.Diagnostico).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.ListarPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.Crear).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/conexiones/{conId}", conexionHandler.Eliminar).Methods("DELETE")
	r.HandleFunc(
		"/api/firestore/{collection}/{documentID}",
		firestoreHandler.GetDocument,
	).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/hijos", equipoHandler.GetHijos).Methods("GET")
	// ============================================
	// ESTRUCTURA PLANTA
	// ============================================

	r.HandleFunc(
			"/api/planta/procesos",
			estructuraPlantaHandler.GetProcesos,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/procesos",
			estructuraPlantaHandler.PostProceso,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/procesos/{proceso_id}/subprocesos",
			estructuraPlantaHandler.GetSubprocesos,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subprocesos",
		estructuraPlantaHandler.GetTodosSubprocesos,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/procesos/{proceso_id}/subprocesos",
		estructuraPlantaHandler.PutRelacionarSubprocesosConProceso,
	).Methods("PUT")

	r.HandleFunc(
			"/api/planta/subprocesos",
			estructuraPlantaHandler.PostSubproceso,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/equipos/{equipo_id}/subproceso",
			estructuraPlantaHandler.PostEquipoSubproceso,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/equipos/{equipo_id}/subproceso",
			estructuraPlantaHandler.GetEquipoSubproceso,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/clasificaciones",
			estructuraPlantaHandler.GetClasificaciones,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/clasificaciones",
			estructuraPlantaHandler.PostClasificacion,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/equipos/{equipo_id}/clasificaciones",
			estructuraPlantaHandler.PostEquipoClasificacion,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/sistemas",
			estructuraPlantaHandler.GetSistemas,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/sistemas",
			estructuraPlantaHandler.PostSistema,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/equipos/{equipo_id}/sistemas",
			estructuraPlantaHandler.PostEquipoSistema,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/equipos/{equipo_id}/componentes",
			estructuraPlantaHandler.GetComponentes,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/componentes",
			estructuraPlantaHandler.PostComponente,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/repuestos",
			estructuraPlantaHandler.GetRepuestos,
	).Methods("GET")

	r.HandleFunc(
			"/api/planta/repuestos",
			estructuraPlantaHandler.PostRepuesto,
	).Methods("POST")

	r.HandleFunc(
			"/api/planta/componentes/{componente_id}/repuestos",
			estructuraPlantaHandler.PostComponenteRepuesto,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/procesos/{id}",
		estructuraPlantaHandler.PutProceso,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/subprocesos/{id}",
		estructuraPlantaHandler.PutSubproceso,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/clasificaciones/{id}",
		estructuraPlantaHandler.PutClasificacion,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/sistemas/{id}",
		estructuraPlantaHandler.PutSistema,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/componentes/{id}",
		estructuraPlantaHandler.PutComponente,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/repuestos/{id}",
		estructuraPlantaHandler.PutRepuesto,
	).Methods("PUT")

	// ============================================
	// ACTUALIZAR RELACIONES ESTRUCTURA PLANTA
	// ============================================

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/subproceso",
		estructuraPlantaHandler.PutEquipoSubproceso,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/clasificaciones",
		estructuraPlantaHandler.PutEquipoClasificaciones,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/sistemas",
		estructuraPlantaHandler.PutEquipoSistemas,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/repuestos",
		estructuraPlantaHandler.PutComponenteRepuestos,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/subprocesos/{subproceso_id}/equipos",
		estructuraPlantaHandler.GetEquiposPorSubproceso,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/clasificaciones",
		estructuraPlantaHandler.GetClasificacionesPorEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/sistemas",
		estructuraPlantaHandler.GetSistemasPorEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/repuestos",
		estructuraPlantaHandler.GetRepuestosPorComponente,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/detalle",
		estructuraPlantaHandler.GetEquipoPlantaDetalle,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/repuestos-detalle",
		estructuraPlantaHandler.GetRepuestosDetallePorComponente,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/repuestos/{repuesto_id}",
		estructuraPlantaHandler.PutComponenteRepuesto,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/equipos/{equipo_id}",
		mantenimientoHandler.GetPorEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/sin-ubicar",
		estructuraPlantaHandler.ListarEquiposSinUbicar,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/sistemas/{sistema_id}/subprocesos",
		estructuraPlantaHandler.ListarSubprocesosSistema,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subprocesos-sistema",
		estructuraPlantaHandler.GetTodosSubprocesosSistema,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subprocesos-sistema",
		estructuraPlantaHandler.CrearSubprocesoSistema,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/subprocesos-sistema/{id}",
		estructuraPlantaHandler.ActualizarSubprocesoSistema,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/subcomponentes",
		estructuraPlantaHandler.ListarSubcomponentes,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subcomponentes",
		estructuraPlantaHandler.CrearSubcomponente,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/subcomponentes/{id}",
		estructuraPlantaHandler.ActualizarSubcomponente,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/subcomponentes/{subcomponente_id}/repuestos",
		estructuraPlantaHandler.ListarRepuestosSubcomponente,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subcomponentes/{subcomponente_id}/repuestos",
		estructuraPlantaHandler.AsignarRepuestoSubcomponente,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/sistemas/equipos-disponibles",
		estructuraPlantaHandler.ListarEquiposDisponiblesSistema,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/sistemas/subprocesos/{subproceso_sistema_id}/equipos",
		estructuraPlantaHandler.ListarEquiposPorSubprocesoSistema,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/sistemas/subprocesos/{subproceso_sistema_id}/equipos",
		estructuraPlantaHandler.AsignarEquipoSubprocesoSistema,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/tipos-equipo",
		tipoEquipoHandler.Listar,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/tipos-equipo",
		tipoEquipoHandler.Crear,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/tipos",
		tipoEquipoHandler.ListarPorEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/tipos",
		tipoEquipoHandler.Asignar,
	).Methods("POST")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/tipos",
		tipoEquipoHandler.Desasignar,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/planta/subprocesos-sistema",
		estructuraPlantaHandler.GetTodosSubprocesosSistema,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/sistemas/{sistema_id}/subprocesos",
		estructuraPlantaHandler.PutRelacionarSubprocesosConSistema,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/subprocesos/{subproceso_id}/equipos-relacion",
		estructuraPlantaHandler.GetEquiposParaRelacionSubproceso,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/subprocesos/{subproceso_id}/equipos-relacion",
		estructuraPlantaHandler.PutRelacionarEquiposConSubproceso,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/componentes-relacion",
		estructuraPlantaHandler.GetComponentesParaRelacionEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/equipos/{equipo_id}/componentes-relacion",
		estructuraPlantaHandler.PutRelacionarComponentesConEquipo,
	).Methods("PUT")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/subcomponentes-relacion",
		estructuraPlantaHandler.GetSubcomponentesParaRelacion,
	).Methods("GET")

	r.HandleFunc(
		"/api/planta/componentes/{componente_id}/subcomponentes-relacion",
		estructuraPlantaHandler.PutRelacionarSubcomponentes,
	).Methods("PUT")

	return r
}
