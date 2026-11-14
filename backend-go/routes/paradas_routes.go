package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarParadasRoutes(
	r *mux.Router,
	paradaHandler *handlers.ParadaHandler,
) {
	r.HandleFunc("/api/paradas", paradaHandler.Listar).Methods("GET")
	r.HandleFunc("/api/paradas/export", paradaHandler.Exportar).Methods("GET")
	r.HandleFunc("/api/paradas/{id}/responsable", paradaHandler.ActualizarResponsable).Methods("PUT")
}
