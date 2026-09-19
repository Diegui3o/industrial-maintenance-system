package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarAuditoriaRoutes(
	r *mux.Router,
	auditoriaHandler *handlers.AuditoriaHandler,
) {
	r.HandleFunc("/api/auditoria", auditoriaHandler.HandleListarAuditoria).Methods("GET")
}
