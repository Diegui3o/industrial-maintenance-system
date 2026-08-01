// handlers/whatsapp_handler.go
package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/models"
	"backend/repository"
	"backend/utils"
	"backend/whatsapp"

	"github.com/gorilla/mux"
)

type WhatsAppHandler struct {
	Repo           *repository.WhatsAppRepository
	WhatsAppClient *whatsapp.WhatsAppClient
	DB             *sql.DB
}

func (h *WhatsAppHandler) ListarGrupos(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida. Usa ?api_key=TU_KEY")
		return
	}
	grupos, err := h.Repo.ListarGruposPorUsuario(usuarioID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	if grupos == nil {
		grupos = []models.GrupoWhatsApp{}
	}
	utils.SuccessJSON(w, http.StatusOK, grupos)
}

func (h *WhatsAppHandler) CrearGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	var g models.GrupoWhatsApp
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if g.Nombre == "" || g.JID == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre y jid son obligatorios")
		return
	}
	if err := h.Repo.CrearGrupo(&g); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	g.UsuarioID = usuarioID
	utils.SuccessJSON(w, http.StatusCreated, g)
}

func (h *WhatsAppHandler) AsociarGrupo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])

	var body struct {
		GrupoID int `json:"grupo_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if err := h.Repo.AsociarEquipoGrupo(equipoID, body.GrupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo asociado al equipo"})
}

// DesasociarGrupo: DELETE /api/equipos/{id}/grupos/{grupoId}
func (h *WhatsAppHandler) DesasociarGrupo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])
	grupoID, _ := strconv.Atoi(vars["grupoId"])

	if err := h.Repo.DesasociarEquipoGrupo(equipoID, grupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Equipo desasociado del grupo"})
}

// ListarEquiposPorGrupo: GET /api/grupos/{id}/equipos
func (h *WhatsAppHandler) ListarEquiposPorGrupo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	grupoID, _ := strconv.Atoi(vars["id"])

	equipos, err := h.Repo.ObtenerEquiposPorGrupo(grupoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	if equipos == nil {
		equipos = []models.Equipo{}
	}
	utils.SuccessJSON(w, http.StatusOK, equipos)
}

// EliminarGrupo: DELETE /api/grupos/{id}
func (h *WhatsAppHandler) EliminarGrupo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	if err := h.Repo.EliminarGrupo(id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo eliminado"})
}

// ActualizarGrupo: PUT /api/grupos/{id}
func (h *WhatsAppHandler) ActualizarGrupo(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var body struct {
		Nombre string `json:"nombre"`
		JID    string `json:"jid"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if err := h.Repo.ActualizarGrupo(id, body.Nombre, body.JID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo actualizado"})
}

func (h *WhatsAppHandler) EnviarMensajePrueba(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var body struct {
		Mensaje string `json:"mensaje"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	// Obtener grupo
	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil {
		log.Printf("ERROR: grupo %d no encontrado: %v", id, err)
		utils.ErrorJSON(w, http.StatusNotFound, "Grupo no encontrado")
		return
	}

	// Enviar mensaje
	err = h.WhatsAppClient.SendToGroup(grupo.JID, body.Mensaje)
	if err != nil {
		log.Printf("ERROR enviando mensaje a grupo %d: %v", id, err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error enviando mensaje")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Mensaje enviado"})
}
func (h *WhatsAppHandler) ListarGruposReales(w http.ResponseWriter, r *http.Request) {
	if h.WhatsAppClient == nil || !h.WhatsAppClient.IsConnected() {
		utils.ErrorJSON(w, http.StatusServiceUnavailable, "WhatsApp no conectado. Vincule primero.")
		return
	}

	groups, err := h.WhatsAppClient.GetGroups()
	if err != nil {
		log.Printf("ERROR obteniendo grupos de WhatsApp: %v", err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo grupos")
		return
	}

	// Convertir a JSON ligero
	var result []map[string]string
	for _, g := range groups {
		result = append(result, map[string]string{
			"jid":    g.JID.String(),
			"nombre": g.Name,
		})
	}

	utils.SuccessJSON(w, http.StatusOK, result)
}

func (h *WhatsAppHandler) requireUsuario(r *http.Request) int {
	apiKey := utils.GetAPIKey(r)
	usuarioID := utils.GetUsuarioIDFromKey(h.DB, apiKey)
	if usuarioID == 0 {
		return 0
	}
	return usuarioID
}

func (h *WhatsAppHandler) EstadoCompleto(w http.ResponseWriter, r *http.Request) {
	conectado := h.WhatsAppClient != nil && h.WhatsAppClient.IsConnected()
	loggedIn := h.WhatsAppClient != nil && h.WhatsAppClient.IsLoggedIn()
	qrDisponible := h.WhatsAppClient != nil && h.WhatsAppClient.LastQR != ""
	var grupos []map[string]string

	if _, err := os.Stat(h.WhatsAppClient.QRPath); err == nil {
		qrDisponible = true
	}

	if conectado && loggedIn {
		groups, err := h.WhatsAppClient.GetGroups()
		if err == nil {
			for _, g := range groups {
				grupos = append(grupos, map[string]string{
					"jid":    g.JID.String(),
					"nombre": g.Name,
				})
			}
		}
	}

	utils.SuccessJSON(w, 200, map[string]interface{}{
		"conectado":     conectado,
		"loggeado":      loggedIn,
		"qr_disponible": qrDisponible,
		"grupos":        grupos,
	})
}

func (h *WhatsAppHandler) ObtenerQR(w http.ResponseWriter, r *http.Request) {
	qrPath := h.WhatsAppClient.QRPath

	if _, err := os.Stat(qrPath); os.IsNotExist(err) {
		utils.ErrorJSON(w, http.StatusNotFound, "QR no disponible.")
		return
	}

	w.Header().Set("Content-Type", "image/png")
	http.ServeFile(w, r, qrPath)
}
func (h *WhatsAppHandler) IniciarBot(w http.ResponseWriter, r *http.Request) {
	// Si no está conectado, intentamos conectar
	if h.WhatsAppClient == nil || !h.WhatsAppClient.IsConnected() {
		err := h.WhatsAppClient.Connect("/app/whatsapp_sessions/session.db")
		if err != nil {
			log.Printf("Error conectando bot: %v", err)
			utils.ErrorJSON(w, 500, "No se pudo iniciar el bot: "+err.Error())
			return
		}
	}

	// Si después de conectar está listo, devolvemos los grupos
	if h.WhatsAppClient.IsConnected() {
		groups, err := h.WhatsAppClient.GetGroups()
		if err == nil {
			var result []map[string]string
			for _, g := range groups {
				result = append(result, map[string]string{
					"jid":    g.JID.String(),
					"nombre": g.Name,
				})
			}
			utils.SuccessJSON(w, 200, map[string]interface{}{
				"conectado": true,
				"grupos":    result,
			})
			return
		}
	}

	// Si no hay grupos, devolvemos QR (por si acaso)
	qrPath := "whatsapp_qr.png"
	if _, err := os.Stat(qrPath); err == nil {
		qrData, _ := os.ReadFile(qrPath)
		qrBase64 := base64.StdEncoding.EncodeToString(qrData)
		utils.SuccessJSON(w, 200, map[string]string{
			"qr": "data:image/png;base64," + qrBase64,
		})
		return
	}

	utils.SuccessJSON(w, 200, map[string]string{
		"mensaje": "Bot conectado, pero no se pudieron obtener los grupos.",
	})
}
func (h *WhatsAppHandler) ReiniciarBot(w http.ResponseWriter, r *http.Request) {
	sessionPath := "/app/whatsapp_sessions/session.db"
	qrPath := h.WhatsAppClient.QRPath

	// Desconectar y limpiar archivos de manera segura
	if h.WhatsAppClient != nil {
		h.WhatsAppClient.Disconnect()
		h.WhatsAppClient.LastQR = ""
	}
	os.Remove(sessionPath)
	os.Remove(qrPath)

	// Pequeña pausa para asegurar que se liberen los recursos
	time.Sleep(500 * time.Millisecond)

	// Intentar reconectar (generará nuevo QR)
	err := h.WhatsAppClient.Connect(sessionPath)
	if err != nil {
		log.Printf("Error conectando bot en reinicio: %v", err)
		utils.ErrorJSON(w, 500, "No se pudo reiniciar el bot: "+err.Error())
		return
	}

	// Verificar si se generó un QR nuevo
	if _, err := os.Stat(qrPath); err == nil {
		qrData, _ := os.ReadFile(qrPath)
		qrBase64 := base64.StdEncoding.EncodeToString(qrData)
		utils.SuccessJSON(w, 200, map[string]string{
			"qr": "data:image/png;base64," + qrBase64,
		})
		return
	}

	utils.SuccessJSON(w, 200, map[string]string{
		"mensaje": "Bot reiniciado. Escanea el nuevo QR.",
	})
}

func (h *WhatsAppHandler) RefreshBot(w http.ResponseWriter, r *http.Request) {
	// Solo conecta si NO está conectado ni logueado
	if h.WhatsAppClient == nil || (!h.WhatsAppClient.IsConnected() && !h.WhatsAppClient.IsLoggedIn()) {
		_ = h.WhatsAppClient.Connect("/app/whatsapp_sessions/session.db")
	}

	conectado := h.WhatsAppClient != nil && h.WhatsAppClient.IsConnected()
	loggedIn := h.WhatsAppClient != nil && h.WhatsAppClient.IsLoggedIn()
	qrDisponible := h.WhatsAppClient != nil && h.WhatsAppClient.LastQR != ""
	var grupos []map[string]string

	if _, err := os.Stat(h.WhatsAppClient.QRPath); err == nil {
		qrDisponible = true
	}

	if conectado && loggedIn {
		groups, err := h.WhatsAppClient.GetGroups()
		if err == nil {
			for _, g := range groups {
				grupos = append(grupos, map[string]string{
					"jid":    g.JID.String(),
					"nombre": g.Name,
				})
			}
		}
	}

	utils.SuccessJSON(w, 200, map[string]interface{}{
		"conectado":     conectado,
		"loggeado":      loggedIn,
		"qr_disponible": qrDisponible,
		"grupos":        grupos,
	})
}
