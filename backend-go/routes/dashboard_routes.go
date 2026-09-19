package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarDashboardRoutes(
	r *mux.Router,
	dashboardHandler *handlers.DashboardHandler,
) {
	r.HandleFunc("/api/dashboard/resumen", dashboardHandler.HandleResumen).Methods("GET")
}
