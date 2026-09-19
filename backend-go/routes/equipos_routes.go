package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarEquiposRoutes(
	r *mux.Router,
	equipoHandler *handlers.EquipoHandler,
	eventosHandler *handlers.EventosHandler,
) {
	r.HandleFunc("/api/equipos", equipoHandler.GetEquipos).Methods("GET")
	r.HandleFunc("/api/equipos", equipoHandler.PostEquipos).Methods("POST")
	r.HandleFunc("/api/equipos/criticos", equipoHandler.ListarCriticos).Methods("GET")
	r.HandleFunc("/api/equipos/raices", equipoHandler.GetRaices).Methods("GET")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.GetEquipoPorID).Methods("GET")
	r.HandleFunc("/api/equipos/{id}", equipoHandler.UpdateEquipos).Methods("PUT")

	r.HandleFunc("/api/equipos/{id}/estado", eventosHandler.CambiarEstado).Methods("PUT")
	r.HandleFunc("/api/equipos/{id}/historial", eventosHandler.GetHistorialEquipo).Methods("GET")

	r.HandleFunc("/api/equipos/crear-con-tags", equipoHandler.CrearEquipoConTags).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/hijos", equipoHandler.GetHijos).Methods("GET")
}
