package routes

import (
	"backend/handlers"
	"github.com/gorilla/mux"
)

func registrarMantenimientoRoutes(
	r *mux.Router,
	mantenimientoHandler *handlers.MantenimientoHandler,
	mantenimientoDetalleHandler *handlers.MantenimientoDetalleHandler,
	mantenimientoOperacionHandler *handlers.MantenimientoOperacionHandler,
) {

	r.HandleFunc(
		"/api/equipos/{id}/mantenimiento",
		mantenimientoHandler.GetPorEquipo,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/{id}",
		mantenimientoHandler.GetPorID,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/{id}",
		mantenimientoHandler.Update,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/completo",
		mantenimientoHandler.ObtenerCompleto,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/{id}/actividades",
		mantenimientoDetalleHandler.CrearActividad,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/actividades",
		mantenimientoDetalleHandler.ListarActividades,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/actividades/{id}",
		mantenimientoDetalleHandler.ActualizarActividad,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/avances",
		mantenimientoDetalleHandler.CrearAvance,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/avances",
		mantenimientoDetalleHandler.ListarAvances,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/avances/{id}",
		mantenimientoDetalleHandler.ActualizarAvance,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/personal",
		mantenimientoDetalleHandler.CrearPersonal,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/personal",
		mantenimientoDetalleHandler.ListarPersonal,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/personal/{id}",
		mantenimientoDetalleHandler.ActualizarPersonal,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/historial",
		mantenimientoDetalleHandler.CrearHistorial,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/historial",
		mantenimientoDetalleHandler.ListarHistorial,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/{id}/programacion",
		mantenimientoOperacionHandler.CrearProgramacion,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/programacion",
		mantenimientoOperacionHandler.ListarProgramacion,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/programacion/{id}",
		mantenimientoOperacionHandler.ActualizarProgramacion,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/ejecucion",
		mantenimientoOperacionHandler.CrearEjecucion,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/ejecucion",
		mantenimientoOperacionHandler.ListarEjecuciones,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/ejecucion/{id}",
		mantenimientoOperacionHandler.ActualizarEjecucion,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/materiales",
		mantenimientoOperacionHandler.CrearMaterial,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/materiales",
		mantenimientoOperacionHandler.ListarMateriales,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/materiales/{id}",
		mantenimientoOperacionHandler.ActualizarMaterial,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/{id}/paradas",
		mantenimientoOperacionHandler.CrearParada,
	).Methods("POST")

	r.HandleFunc(
		"/api/mantenimiento/{id}/paradas",
		mantenimientoOperacionHandler.ListarParadas,
	).Methods("GET")

	r.HandleFunc(
		"/api/mantenimiento/paradas/{id}",
		mantenimientoOperacionHandler.ActualizarParada,
	).Methods("PUT")

	r.HandleFunc(
		"/api/mantenimiento/actividades/{id}",
		mantenimientoDetalleHandler.EliminarActividad,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/avances/{id}",
		mantenimientoDetalleHandler.EliminarAvance,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/personal/{id}",
		mantenimientoDetalleHandler.EliminarPersonal,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/programacion/{id}",
		mantenimientoOperacionHandler.EliminarProgramacion,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/ejecucion/{id}",
		mantenimientoOperacionHandler.EliminarEjecucion,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/materiales/{id}",
		mantenimientoOperacionHandler.EliminarMaterial,
	).Methods("DELETE")

	r.HandleFunc(
		"/api/mantenimiento/paradas/{id}",
		mantenimientoOperacionHandler.EliminarParada,
	).Methods("DELETE")
}
