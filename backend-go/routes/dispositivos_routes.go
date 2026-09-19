package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarDispositivosRoutes(
	r *mux.Router,
	dispositivoHandler *handlers.DispositivoRedHandler,
) {
	r.HandleFunc("/api/dispositivos", dispositivoHandler.ListarTodos).Methods("GET")
	r.HandleFunc("/api/dispositivos", dispositivoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.ObtenerPorID).Methods("GET")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.Actualizar).Methods("PUT")
	r.HandleFunc("/api/dispositivos/{id}", dispositivoHandler.Eliminar).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/dispositivos", dispositivoHandler.Crear).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/dispositivos", dispositivoHandler.ListarPorEquipo).Methods("GET")
}
