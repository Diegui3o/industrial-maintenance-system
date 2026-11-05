package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarActivosRoutes(
	r *mux.Router,
	activoHandler *handlers.ActivoHandler,
) {
	r.HandleFunc("/api/activos/{tipo}/{id}/estado", activoHandler.CambiarEstado).Methods("PUT")
	r.HandleFunc("/api/activos/{tipo}/{id}/estado", activoHandler.ObtenerEstado).Methods("GET")
}