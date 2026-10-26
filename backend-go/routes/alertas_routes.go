package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarAlertasRoutes(
	r *mux.Router,
	alertaHandler *handlers.AlertaHandler,
) {
	r.HandleFunc("/api/alertas", alertaHandler.ListarActivas).Methods("GET")
	r.HandleFunc("/api/alertas/{id}/descartar", alertaHandler.Descartar).Methods("PUT")
	r.HandleFunc("/api/alertas/{id}/ver", alertaHandler.MarcarVista).Methods("PUT")
}