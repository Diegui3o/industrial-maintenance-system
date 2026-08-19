package handlers

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"backend/models"
	"backend/repository"
	"backend/services"
	"backend/utils"
	"backend/whatsapp"

	"github.com/gorilla/mux"
)

type WhatsAppHandler struct {
	Repo    *repository.WhatsAppRepository
	Manager *services.WhatsAppManager
	DB      *sql.DB
}

const QRPathGlobal = "/app/whatsapp_sessions/whatsapp_qr.png"

// =========================================================
// HELPERS
// =========================================================

func (h *WhatsAppHandler) requireUsuario(r *http.Request) int {
	apiKey := utils.GetAPIKey(r)
	return utils.GetUsuarioIDFromKey(h.DB, apiKey)
}

func (h *WhatsAppHandler) getCliente(r *http.Request) (*whatsapp.WhatsAppClient, int) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		return nil, 0
	}
	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil {
		return nil, usuarioID
	}
	return cliente, usuarioID
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// =========================================================
// GRUPOS VINCULADOS
// =========================================================

func (h *WhatsAppHandler) ListarGrupos(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
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
	json.NewDecoder(r.Body).Decode(&g)
	if g.Nombre == "" || g.JID == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre y jid son obligatorios")
		return
	}

	existing, _ := h.Repo.ObtenerGrupoPorJID(g.JID)
	if existing != nil {
		utils.SuccessJSON(w, http.StatusOK, existing)
		return
	}

	g.UsuarioID = usuarioID
	if err := h.Repo.CrearGrupo(&g); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusCreated, g)
}

func (h *WhatsAppHandler) ActualizarGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}

	var body struct {
		Nombre string `json:"nombre"`
		JID    string `json:"jid"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if err := h.Repo.ActualizarGrupo(id, body.Nombre, body.JID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo actualizado"})
}

func (h *WhatsAppHandler) EliminarGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}
	if err := h.Repo.EliminarGrupo(id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo eliminado"})
}

func (h *WhatsAppHandler) ListarEquiposPorGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	grupoID, _ := strconv.Atoi(vars["id"])

	grupo, err := h.Repo.ObtenerGrupoPorID(grupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}
	equipos, _ := h.Repo.ObtenerEquiposPorGrupo(grupoID)
	utils.SuccessJSON(w, http.StatusOK, equipos)
}

func (h *WhatsAppHandler) ListarGruposPorEquipo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])

	grupos, _ := h.Repo.ObtenerGruposPorEquipo(equipoID)
	var filtrados []models.GrupoWhatsApp
	for _, g := range grupos {
		if g.UsuarioID == usuarioID {
			filtrados = append(filtrados, g)
		}
	}
	utils.SuccessJSON(w, http.StatusOK, filtrados)
}

func (h *WhatsAppHandler) AsociarGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])
	var body struct {
		GrupoID int `json:"grupo_id"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	grupo, err := h.Repo.ObtenerGrupoPorID(body.GrupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}
	if err := h.Repo.AsociarEquipoGrupo(equipoID, body.GrupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo asociado"})
}

func (h *WhatsAppHandler) DesasociarGrupo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])
	grupoID, _ := strconv.Atoi(vars["grupoId"])

	grupo, err := h.Repo.ObtenerGrupoPorID(grupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}
	if err := h.Repo.DesasociarEquipoGrupo(equipoID, grupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Equipo desasociado"})
}

// =========================================================
// WHATSAPP (BOT POR USUARIO)
// =========================================================

func (h *WhatsAppHandler) ListarGruposReales(w http.ResponseWriter, r *http.Request) {
	cliente, _ := h.getCliente(r)
	if cliente == nil {
		utils.ErrorJSON(w, http.StatusUnauthorized, "No hay bot vinculado")
		return
	}
	groups, _ := cliente.GetGroups()
	var result []map[string]string
	for _, g := range groups {
		result = append(result, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
	}
	utils.SuccessJSON(w, http.StatusOK, result)
}

func (h *WhatsAppHandler) EnviarMensajePrueba(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var body struct {
		Mensaje string `json:"mensaje"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso")
		return
	}

	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil || !cliente.IsLoggedIn() {
		utils.ErrorJSON(w, http.StatusUnauthorized, "No hay bot vinculado")
		return
	}
	log.Printf("Enviando mensaje a grupo %s", grupo.Nombre)
	if err := cliente.SendToGroup(grupo.JID, body.Mensaje); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	if cliente == nil {
		utils.ErrorJSON(w, http.StatusUnauthorized, "No hay bot vinculado")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Mensaje enviado"})
}

func (h *WhatsAppHandler) EstadoCompleto(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.SuccessJSON(w, 200, map[string]interface{}{"conectado": false, "loggeado": false, "qr_disponible": false, "grupos": []map[string]string{}})
		return
	}

	qrDisponible := fileExists(QRPathGlobal)
	cliente, err := h.Manager.GetClient(usuarioID)
	conectado := err == nil && cliente.IsConnected()
	loggedIn := err == nil && cliente.IsLoggedIn()

	var grupos []map[string]string
	if loggedIn && conectado {
		groups, _ := cliente.GetGroups()
		for _, g := range groups {
			grupos = append(grupos, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
		}
	}

	utils.SuccessJSON(w, 200, map[string]interface{}{
		"conectado": conectado, "loggeado": loggedIn, "qr_disponible": qrDisponible, "grupos": grupos,
	})
}

func (h *WhatsAppHandler) ObtenerQR(w http.ResponseWriter, r *http.Request) {
	if !fileExists(QRPathGlobal) {
		utils.ErrorJSON(w, http.StatusNotFound, "QR no disponible.")
		return
	}

	// Evitar que el navegador cachee la imagen
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	w.Header().Set("Content-Type", "image/png")
	http.ServeFile(w, r, QRPathGlobal)
}

func (h *WhatsAppHandler) IniciarBot(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)

	// Crear instancia si no existe
	if _, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID); err != nil {
		if err := h.Manager.CrearInstancia(usuarioID, ruta); err != nil {
			utils.ErrorJSON(w, 500, "No se pudo crear instancia: "+err.Error())
			return
		}
	}

	// Obtener instancia (ya debe existir)
	instancia, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	if err != nil {
		utils.ErrorJSON(w, 500, "No se pudo obtener instancia: "+err.Error())
		return
	}

	// Crear cliente y conectar (generará QR)
	cliente := whatsapp.NewWhatsAppClient()
	if err := cliente.Connect(instancia.RutaSesion); err != nil {
		log.Printf("Error conectando en IniciarBot: %v", err)
	}
	h.Manager.UpdateClient(usuarioID, cliente)

	// Esperar a que aparezca el QR o se loguee
	deadline := time.Now().Add(10 * time.Second)
	for time.Now().Before(deadline) {
		if cliente.LastQR != "" {
			qrData, _ := os.ReadFile(QRPathGlobal)
			qrBase64 := base64.StdEncoding.EncodeToString(qrData)
			utils.SuccessJSON(w, 200, map[string]string{"qr": "data:image/png;base64," + qrBase64})
			return
		}
		if cliente.IsLoggedIn() {
			groups, _ := cliente.GetGroups()
			var result []map[string]string
			for _, g := range groups {
				result = append(result, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
			}
			utils.SuccessJSON(w, 200, map[string]interface{}{"conectado": true, "grupos": result})
			return
		}
		time.Sleep(300 * time.Millisecond)
	}

	utils.ErrorJSON(w, 500, "No se pudo obtener QR a tiempo")
}

func (h *WhatsAppHandler) ReiniciarBot(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	instancia, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	if err != nil {
		ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		h.Manager.CrearInstancia(usuarioID, ruta)
		instancia, _ = h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	}

	os.Remove(instancia.RutaSesion)
	os.Remove(instancia.RutaSesion + "-wal")
	os.Remove(instancia.RutaSesion + "-shm")
	os.Remove(QRPathGlobal)

	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil || cliente == nil {
		cliente = whatsapp.NewWhatsAppClient()
		h.Manager.UpdateClient(usuarioID, cliente)
	}
	cliente.Disconnect()
	cliente.LastQR = ""

	go cliente.Connect(instancia.RutaSesion)

	deadline := time.Now().Add(10 * time.Second)
	for time.Now().Before(deadline) {
		if cliente.LastQR != "" {
			qrData, _ := os.ReadFile(QRPathGlobal)
			qrBase64 := base64.StdEncoding.EncodeToString(qrData)
			utils.SuccessJSON(w, 200, map[string]string{"qr": "data:image/png;base64," + qrBase64})
			return
		}
		time.Sleep(300 * time.Millisecond)
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Bot reiniciado"})
}

func (h *WhatsAppHandler) RefreshBot(w http.ResponseWriter, r *http.Request) {
	h.EstadoCompleto(w, r)
}

// AsegurarInstancia crea la instancia si no existe
func (h *WhatsAppHandler) AsegurarInstancia(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	// Si no existe, crear
	if _, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID); err != nil {
		ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		if err := h.Manager.CrearInstancia(usuarioID, ruta); err != nil {
			utils.ErrorJSON(w, 500, "No se pudo crear instancia")
			return
		}
	}

	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Instancia asegurada"})
}
