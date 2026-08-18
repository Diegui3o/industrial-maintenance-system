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
	usuarioID := utils.GetUsuarioIDFromKey(h.DB, apiKey)
	return usuarioID
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

	existing, err := h.Repo.ObtenerGrupoPorJID(g.JID)
	if err == nil && existing != nil {
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

	grupo, err := h.Repo.ObtenerGrupoPorID(id)
	if err != nil || grupo.UsuarioID != usuarioID {
		utils.ErrorJSON(w, http.StatusForbidden, "No tienes permiso para enviar mensajes a este grupo")
		return
	}

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

func (h *WhatsAppHandler) EstadoCompleto(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.SuccessJSON(w, 200, map[string]interface{}{
			"conectado":     false,
			"loggeado":      false,
			"qr_disponible": false,
			"grupos":        []map[string]string{},
		})
		return
	}

	// Verificar QR global independientemente del cliente
	qrDisponible := fileExists(QRPathGlobal)

	cliente, err := h.Manager.GetClient(usuarioID)
	conectado := err == nil && cliente.IsConnected()
	loggedIn := err == nil && cliente.IsLoggedIn()

	var grupos []map[string]string
	if loggedIn && conectado {
		groups, _ := cliente.GetGroups()
		for _, g := range groups {
			grupos = append(grupos, map[string]string{
				"jid":    g.JID.String(),
				"nombre": g.Name,
			})
		}
	}
	log.Printf("DEBUG qrDisponible=%v, QRPathGlobal=%s, fileExists=%v", qrDisponible, QRPathGlobal, fileExists(QRPathGlobal))
	utils.SuccessJSON(w, 200, map[string]interface{}{
		"conectado":     conectado,
		"loggeado":      loggedIn,
		"qr_disponible": qrDisponible,
		"grupos":        grupos,
	})
}

func (h *WhatsAppHandler) ObtenerQR(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat(QRPathGlobal); os.IsNotExist(err) {
		utils.ErrorJSON(w, http.StatusNotFound, "QR no disponible.")
		return
	}
	w.Header().Set("Content-Type", "image/png")
	http.ServeFile(w, r, QRPathGlobal)
}

func (h *WhatsAppHandler) IniciarBot(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	// Obtener o crear instancia
	instancia, err := h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	if err != nil {
		ruta := fmt.Sprintf("/app/whatsapp_sessions/session_usuario_%d.db", usuarioID)
		if err := h.Manager.CrearInstancia(usuarioID, ruta); err != nil {
			utils.ErrorJSON(w, 500, "No se pudo crear la instancia")
			return
		}
		instancia, _ = h.Repo.ObtenerInstanciaPorUsuario(usuarioID)
	}

	// Obtener o crear cliente en el manager
	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil {
		cliente = whatsapp.NewWhatsAppClient()
		h.Manager.UpdateClient(usuarioID, cliente)
	}

	// Si no está logueado, lanzar la conexión en segundo plano
	if !cliente.IsLoggedIn() {
		go func() {
			if err := cliente.Connect(instancia.RutaSesion); err != nil {
				log.Printf("Error conectando en IniciarBot: %v", err)
			}
		}()

		// Esperar un poco a que se genere el QR
		time.Sleep(2 * time.Second)
	}

	// Si el QR ya existe, devolverlo en base64
	if _, err := os.Stat(QRPathGlobal); err == nil {
		qrData, _ := os.ReadFile(QRPathGlobal)
		qrBase64 := base64.StdEncoding.EncodeToString(qrData)
		utils.SuccessJSON(w, 200, map[string]string{"qr": "data:image/png;base64," + qrBase64})
		return
	}

	// Si ya está logueado, devolver grupos
	if cliente.IsLoggedIn() {
		groups, _ := cliente.GetGroups()
		var result []map[string]string
		for _, g := range groups {
			result = append(result, map[string]string{"jid": g.JID.String(), "nombre": g.Name})
		}
		utils.SuccessJSON(w, 200, map[string]interface{}{"conectado": true, "grupos": result})
		return
	}

	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Iniciando, espera unos segundos..."})
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

	rutaSesion := instancia.RutaSesion
	os.Remove(rutaSesion)
	os.Remove(rutaSesion + "-wal")
	os.Remove(rutaSesion + "-shm")

	cliente, err := h.Manager.GetClient(usuarioID)
	if err != nil {
		cliente = whatsapp.NewWhatsAppClient()
	}
	cliente.Disconnect()
	cliente.LastQR = ""
	os.Remove(cliente.QRPath)

	if err := cliente.Connect(rutaSesion); err != nil {
		log.Printf("Error conectando en ReiniciarBot: %v", err)
		utils.ErrorJSON(w, 500, "No se pudo reiniciar el bot")
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

func (h *WhatsAppHandler) RefreshBot(w http.ResponseWriter, r *http.Request) {
	h.EstadoCompleto(w, r)
}

// ListarGruposPorEquipo devuelve los grupos asociados a un equipo
// GET /api/equipos/{id}/grupos
func (h *WhatsAppHandler) ListarGruposPorEquipo(w http.ResponseWriter, r *http.Request) {
	usuarioID := h.requireUsuario(r)
	if usuarioID == 0 {
		utils.ErrorJSON(w, http.StatusUnauthorized, "API Key requerida")
		return
	}

	vars := mux.Vars(r)
	equipoID, _ := strconv.Atoi(vars["id"])

	grupos, err := h.Repo.ObtenerGruposPorEquipo(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Filtrar solo los grupos que pertenecen al usuario autenticado
	var gruposUsuario []models.GrupoWhatsApp
	for _, g := range grupos {
		if g.UsuarioID == usuarioID {
			gruposUsuario = append(gruposUsuario, g)
		}
	}

	if gruposUsuario == nil {
		gruposUsuario = []models.GrupoWhatsApp{}
	}
	utils.SuccessJSON(w, http.StatusOK, gruposUsuario)
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
