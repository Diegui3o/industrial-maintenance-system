package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarTiempoRealRoutes(
	r *mux.Router,
	tiempoRealHandler *handlers.TiempoRealHandler,
) {
	r.HandleFunc("/equipos/{id}/tiempo-real", tiempoRealHandler.GetUltimosValores).Methods("GET")
	r.HandleFunc("/equipos/{id}/tiempo-real/{parametro}", tiempoRealHandler.GetUltimoValor).Methods("GET")
	r.HandleFunc("/equipos/{id}/historico/{parametro}", tiempoRealHandler.GetHistoricoTag).Methods("GET")
	r.HandleFunc("/equipos/{id}/tags", tiempoRealHandler.GetTagsByEquipo).Methods("GET")
}
