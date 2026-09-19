package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarConexionesRoutes(
	r *mux.Router,
	conexionHandler *handlers.ConexionHandler,
) {
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.ListarPorEquipo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/conexiones", conexionHandler.Crear).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/conexiones/{conId}", conexionHandler.Eliminar).Methods("DELETE")
}
