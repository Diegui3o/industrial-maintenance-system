package routes

import (
	"backend/handlers"
	"github.com/gorilla/mux"
)

func registrarPlantaRoutes(
	r *mux.Router,
	estructuraPlantaHandler *handlers.EstructuraPlantaHandler,
	tipoEquipoHandler *handlers.TipoEquipoHandler,
) {

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

}
