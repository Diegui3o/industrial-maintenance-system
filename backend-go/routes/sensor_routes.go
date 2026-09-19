package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarSensorRoutes(
	r *mux.Router,
	sensorHandler *handlers.SensorHandler,
) {
	r.HandleFunc("/api/v1/eventos/sensor", sensorHandler.RecibirBatch).Methods("POST")
}
