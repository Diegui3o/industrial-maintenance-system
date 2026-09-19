package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarDiagnosticoRoutes(
	r *mux.Router,
	diagHandler *handlers.DiagnosticoHandler,
) {
	r.HandleFunc("/api/diagnostico", diagHandler.Diagnostico).Methods("GET")
}
