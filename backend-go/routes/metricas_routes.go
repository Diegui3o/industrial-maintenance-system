package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarMetricasRoutes(
	r *mux.Router,
	metricaHandler *handlers.MetricaHandler,
) {
	r.HandleFunc("/api/metricas", metricaHandler.CrearMetrica).Methods("POST")
}
