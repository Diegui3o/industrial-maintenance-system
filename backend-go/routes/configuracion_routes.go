package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarConfiguracionRoutes(
	r *mux.Router,
	configHandler *handlers.ConfigHandler,
) {
	r.HandleFunc("/api/config/umbrales", configHandler.CrearUmbral).Methods("POST")
	r.HandleFunc("/api/config/fuentes", configHandler.ListarFuentes).Methods("GET")
	r.HandleFunc("/api/config/fuentes", configHandler.CrearFuente).Methods("POST")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ObtenerFuente).Methods("GET")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.ActualizarFuente).Methods("PUT")
	r.HandleFunc("/api/config/fuentes/{id}", configHandler.EliminarFuente).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/fuentes", configHandler.ListarFuentesPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/umbrales", configHandler.ListarUmbrales).Methods("GET")
}
