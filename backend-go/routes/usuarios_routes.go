package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarUsuariosRoutes(
	r *mux.Router,
	usuarioHandler *handlers.UsuarioHandler,
) {
	r.HandleFunc("/api/usuarios/keys", usuarioHandler.ListarConKeys).Methods("GET")
	r.HandleFunc("/api/usuarios", usuarioHandler.Crear).Methods("POST")
	r.HandleFunc("/api/usuarios", usuarioHandler.Listar).Methods("GET")
	r.HandleFunc("/api/usuarios/{id}", usuarioHandler.ObtenerPorID).Methods("GET")
}
