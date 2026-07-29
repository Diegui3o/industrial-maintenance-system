// handlers/whatsapp_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/utils"

	"github.com/gorilla/mux"
)

type WhatsAppHandler struct {
	Repo *repository.WhatsAppRepository
}

func (h *WhatsAppHandler) ListarGrupos(w http.ResponseWriter, r *http.Request) {
	grupos, err := h.Repo.ListarGrupos()
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
