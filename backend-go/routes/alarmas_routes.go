package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarAlarmasRoutes(
	r *mux.Router,
	alarmaHandler *handlers.AlarmaHandler,
) {
	r.HandleFunc("/api/alarmas", alarmaHandler.CrearAlarma).Methods("POST")
	r.HandleFunc("/api/alarmas", alarmaHandler.ListarActivas).Methods("GET")
	r.HandleFunc("/api/alarmas/{id}/atender", alarmaHandler.Atender).Methods("PUT")
	r.HandleFunc("/api/alarmas/{id}/cerrar", alarmaHandler.Cerrar).Methods("PUT")
	r.HandleFunc("/api/equipos/{id}/alarmas", alarmaHandler.ListarPorEquipo).Methods("GET")
}
