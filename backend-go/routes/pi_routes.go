package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarPIRoutes(
	r *mux.Router,
	piTagHandler *handlers.PITagHandler,
	tagDescubiertoHandler *handlers.TagDescubiertoHandler,
	equipoTagHandler *handlers.EquipoTagHandler,
) {
	r.HandleFunc("/api/pi/tags/sin-equipo", piTagHandler.GetTagsSinEquipo).Methods("GET")
	r.HandleFunc("/api/pi/tags/sugerencias", piTagHandler.GetSugerenciasAgrupacion).Methods("GET")
	r.HandleFunc("/api/pi/tags/asignar", piTagHandler.AsignarTagsEquipo).Methods("POST")
	r.HandleFunc("/api/pi/tags/crear-equipo", piTagHandler.CrearEquipoConTags).Methods("POST")
	r.HandleFunc("/api/pi/tags/equipo/{id}", piTagHandler.GetTagsByEquipo).Methods("GET")
	r.HandleFunc("/api/pi/fuentes", piTagHandler.GetFuentesDisponibles).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/tags", equipoTagHandler.GetTagsByEquipo).Methods("GET")

	r.HandleFunc("/api/pi/tags/descubiertos", tagDescubiertoHandler.GetTagsDescubiertos).Methods("GET")
	r.HandleFunc("/api/pi/tags/descubiertos/{id}", tagDescubiertoHandler.GetTagDescubierto).Methods("GET")
	r.HandleFunc("/api/pi/tags/descubiertos/{id}", tagDescubiertoHandler.EliminarTag).Methods("DELETE")
	r.HandleFunc("/api/pi/tags/asignar", tagDescubiertoHandler.AsignarTag).Methods("POST")
	r.HandleFunc("/api/pi/tags/asignar-multiple", tagDescubiertoHandler.AsignarMultiplesTags).Methods("POST")

	r.HandleFunc("/api/pi/tags/agrupados", piTagHandler.GetTagsAgrupados).Methods("GET")
	r.HandleFunc("/api/pi/tags/jerarquia", piTagHandler.GetTagsJerarquia).Methods("GET")
	r.HandleFunc("/api/pi/tags/estructura", piTagHandler.GetEstructuraTags).Methods("GET")
	r.HandleFunc("/api/pi/tags/valor", piTagHandler.GetTagValor).Methods("GET")
}
