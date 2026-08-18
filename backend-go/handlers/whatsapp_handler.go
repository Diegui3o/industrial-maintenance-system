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

// =========================================================
// HELPERS
// =========================================================

// requireUsuario extrae el usuarioID desde la API Key
func (h *WhatsAppHandler) requireUsuario(r *http.Request) int {
	apiKey := utils.GetAPIKey(r)
	usuarioID := utils.GetUsuarioIDFromKey(h.DB, apiKey)
	if usuarioID == 0 {
		return 0
	}
	return usuarioID
}

// getCliente obtiene el cliente de WhatsApp para el usuario autenticado
func (h *WhatsAppHandler) getCliente(r *http.Request) (*whatsapp.WhatsAppClient, int) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		return nil, 0
	}
	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil || !cliente.IsLoggedIn() {
		return nil, usuarioID
	}
	return cliente, usuarioID
}

// =========================================================
// GRUPOS VINCULADOS (BASE DE DATOS)
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
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if g.Nombre == "" || g.JID == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre y jid son obligatorios")
		return
	}

	// Verificar si ya existe
	existing, err := h.Repo.ObtenerGrupoPorJID(g.JID)
	if err == nil && existing != nil {
		// Si ya existe, devolver el existente (aunque pertenezca a otro usuario, no lo sobreescribimos)
		utils.SuccessJSON(w, http.StatusOK, existing)
		return
	}

	g.UsuarioID = usuarioID
	if err := h.Repo.CrearGrupo(&g); err != nil {
		log.Printf("ERROR creando grupo: %v", err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al crear grupo")
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

	// Verificar que el grupo pertenezca al usuario
	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para modificar este grupo")
		return
	}

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
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para eliminar este grupo")
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

	// Verificar que el grupo pertenezca al usuario
	grupo, err := h.Repo.ObtenerGrupoPorID(grupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para ver este grupo")
		return
	}

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
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	// Verificar que el grupo pertenezca al usuario
	grupo, err := h.Repo.ObtenerGrupoPorID(body.GrupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para asociar equipos a este grupo")
		return
	}

	if err := h.Repo.AsociarEquipoGrupo(equipoID, body.GrupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Grupo asociado al equipo"})
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

	// Verificar que el grupo pertenezca al usuario
	grupo, err := h.Repo.ObtenerGrupoPorID(grupoID)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para desasociar este grupo")
		return
	}

	if err := h.Repo.DesasociarEquipoGrupo(equipoID, grupoID); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Equipo desasociado del grupo"})
}

// =========================================================
// WHATSAPP (BOT POR USUARIO)
// =========================================================

// ListarGruposReales obtiene los grupos reales del bot del usuario
func (h *WhatsAppHandler) ListarGruposReales(w http.ResponseWriter, r *http.Request) {
	cliente, usuarioID := h.getCliente(r)
	if cliente == nil {
		utils.ErrorJSON(w, http.StatusUnauthorized, "No hay bot de WhatsApp vinculado para este usuario")
		return
	}
	_ = usuarioID

	groups, err := cliente.GetGroups()
	if err != nil {
		log.Printf("ERROR obteniendo grupos de WhatsApp: %v", err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo grupos")
		return
	}

	var result []map[string]string
	for _, g := range groups {
		result = append(result, map[string]string{
			"jid":    g.JID.String(),
			"nombre": g.Name,
		})
	}
	utils.SuccessJSON(w, http.StatusOK, result)
}

// EnviarMensajePrueba envía un mensaje a un grupo del usuario
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
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	// Obtener el grupo y verificar propiedad
	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para enviar mensajes a este grupo")
		return
	}

	// Obtener cliente de WhatsApp del usuario
	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil || !cliente.IsLoggedIn() {
		utils.ErrorJSON(w, http.StatusUnauthorized, "No hay bot de WhatsApp vinculado para este usuario")
		return
	}

	if err := cliente.SendToGroup(grupo.JID, body.Mensaje); err != nil {
		log.Printf("ERROR enviando mensaje a grupo %d: %v", id, err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error enviando mensaje")
		return
	}
	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Mensaje enviado"})
}

// EstadoCompleto devuelve el estado del bot del usuario
func (h *WhatsAppHandler) EstadoCompleto(w http.ResponseWriter, r *http.Request) {
	cliente, _ := h.getCliente(r)
	if cliente == nil {
		utils.SuccessJSON(w, 200, map[string]interface{}{
			"conectado":     false,
			"loggeado":      false,
			"qr_disponible": false,
			"grupos":        []map[string]string{},
		})
		return
	}

	conectado := cliente.IsConnected()
	loggedIn := cliente.IsLoggedIn()
	qrDisponible := cliente.LastQR != ""
	var grupos []map[string]string

	if _, err := os.Stat(cliente.QRPath); err == nil {
		qrDisponible = true
	}

	if conectado && loggedIn {
		groups, err := cliente.GetGroups()
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

// ObtenerQR devuelve el QR del bot del usuario
func (h *WhatsAppHandler) ObtenerQR(w http.ResponseWriter, r *http.Request) {
	cliente, _ := h.getCliente(r)
	if cliente == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "No hay QR disponible")
		return
	}

	if _, err := os.Stat(cliente.QRPath); os.IsNotExist(err) {
		utils.ErrorJSON(w, http.StatusNotFound, "QR no disponible.")
		return
	}

	w.Header().Set("Content-Type", "image/png")
	http.ServeFile(w, r, cliente.QRPath)
}

// IniciarBot inicia o genera QR para el bot del usuario
func (h *WhatsAppHandler) IniciarBot(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	// Verificar si ya existe instancia para el usuario
	_, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	if err != nil {
		// No existe, crear una nueva
		rutaSesion := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		if err := h.Manager.CrearInstancia(usuarioID, rutaSesion); err != nil {
			log.Printf("Error creando instancia: %v", err)
			utils.ErrorJSON(w, 500, "No se pudo crear la instancia")
			return
		}
	}

	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil || !cliente.IsLoggedIn() {
		// Si no está logueado, intentar conectar (generará QR)
		if cliente == nil {
			cliente = whatsapp.NewWhatsAppClient()
		}
		ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		if err := cliente.Connect(ruta); err != nil {
			log.Printf("Error conectando bot: %v", err)
			utils.ErrorJSON(w, 500, "No se pudo iniciar el bot: "+err.Error())
			return
		}
		h.Manager.UpdateClient(usuarioID, cliente)
	}

	// Devolver estado o QR
	if cliente.IsLoggedIn() {
		groups, _ := cliente.GetGroups()
		var result []map[string]string
		for _, g := range groups {
			result = append(result, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
		}
		utils.SuccessJSON(w, 200, map[string]interface{}{"conectado": true, "grupos": result})
		return
	}

	if cliente.LastQR != "" {
		qrData, _ := os.ReadFile(cliente.QRPath)
		qrBase64 := base64.StdEncoding.EncodeToString(qrData)
		utils.SuccessJSON(w, 200, map[string]string{"qr": "data:image/png;base64," + qrBase64})
		return
	}

	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Bot iniciado, escanea el QR"})
}

// ReiniciarBot reinicia la sesión del usuario (para escanear nuevo QR)
func (h *WhatsAppHandler) ReiniciarBot(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
	os.Remove(ruta)
	os.Remove(ruta + "-wal")
	os.Remove(ruta + "-shm")

	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil {
		cliente = whatsapp.NewWhatsAppClient()
	}
	cliente.Disconnect()
	cliente.LastQR = ""
	os.Remove(cliente.QRPath)

	if err := cliente.Connect(ruta); err != nil {
		log.Printf("Error conectando bot en reinicio: %v", err)
		utils.ErrorJSON(w, 500, "No se pudo reiniciar el bot: "+err.Error())
		return
	}
	h.Manager.UpdateClient(usuarioID, cliente)

	if cliente.LastQR != "" {
		qrData, _ := os.ReadFile(cliente.QRPath)
		qrBase64 := base64.StdEncoding.EncodeToString(qrData)
		utils.SuccessJSON(w, 200, map[string]string{"qr": "data:image/png;base64," + qrBase64})
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Bot reiniciado"})
}

// RefreshBot refresca el estado del bot del usuario
func (h *WhatsAppHandler) RefreshBot(w http.ResponseWriter, r *http.Request) {
	cliente, usuarioID := h.getCliente(r)
	if cliente == nil {
		utils.SuccessJSON(w, 200, map[string]interface{}{"conectado": false, "loggeado": false})
		return
	}
	_ = usuarioID

	if !cliente.IsConnected() && !cliente.IsLoggedIn() {
		ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		_ = cliente.Connect(ruta)
	}

	conectado := cliente.IsConnected()
	loggedIn := cliente.IsLoggedIn()
	qrDisponible := cliente.LastQR != ""
	var grupos []map[string]string
	if _, err := os.Stat(cliente.QRPath); err == nil {
		qrDisponible = true
	}
	if conectado && loggedIn {
		groups, _ := cliente.GetGroups()
		for _, g := range groups {
			grupos = append(grupos, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
		}
	}
	utils.SuccessJSON(w, 200, map[string]interface{}{
		"conectado":     conectado,
		"loggeado":      loggedIn,
		"qr_disponible": qrDisponible,
		"grupos":        grupos,
	})
}
