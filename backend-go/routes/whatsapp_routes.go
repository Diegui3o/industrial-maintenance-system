package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarWhatsappRoutes(
	r *mux.Router,
	whatsappHandler *handlers.WhatsAppHandler,
) {
	r.HandleFunc("/api/grupos", whatsappHandler.ListarGrupos).Methods("GET")
	r.HandleFunc("/api/grupos", whatsappHandler.CrearGrupo).Methods("POST")
	r.HandleFunc("/api/grupos/{id}", whatsappHandler.ActualizarGrupo).Methods("PUT")
	r.HandleFunc("/api/grupos/{id}", whatsappHandler.EliminarGrupo).Methods("DELETE")
	r.HandleFunc("/api/grupos/{id}/equipos", whatsappHandler.ListarEquiposPorGrupo).Methods("GET")
	r.HandleFunc("/api/equipos/{id}/grupos", whatsappHandler.AsociarGrupo).Methods("POST")
	r.HandleFunc("/api/equipos/{id}/grupos/{grupoId}", whatsappHandler.DesasociarGrupo).Methods("DELETE")
	r.HandleFunc("/api/equipos/{id}/grupos", whatsappHandler.ListarGruposPorEquipo).Methods("GET")
	r.HandleFunc("/api/grupos/{id}/enviar", whatsappHandler.EnviarMensajePrueba).Methods("POST")
	r.HandleFunc("/api/whatsapp/grupos", whatsappHandler.ListarGruposReales).Methods("GET")
	r.HandleFunc("/api/whatsapp/estado_completo", whatsappHandler.EstadoCompleto).Methods("GET")
	r.HandleFunc("/api/whatsapp/qr", whatsappHandler.ObtenerQR).Methods("GET")
	r.HandleFunc("/api/whatsapp/iniciar", whatsappHandler.IniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/reiniciar", whatsappHandler.ReiniciarBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/refresh", whatsappHandler.RefreshBot).Methods("POST")
	r.HandleFunc("/api/whatsapp/asegurar-instancia", whatsappHandler.AsegurarInstancia).Methods("POST")
}
