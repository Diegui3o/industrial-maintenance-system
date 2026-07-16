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

type ConfigHandler struct {
	Repo *repository.ConfigRepository
}

func (h *ConfigHandler) CrearUmbral(w http.ResponseWriter, r *http.Request) {
	var u models.ConfigUmbral
	json.NewDecoder(r.Body).Decode(&u)
	if err := h.Repo.CrearUmbral(&u); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 201, u)
}

func (h *ConfigHandler) CrearFuente(w http.ResponseWriter, r *http.Request) {
	var f models.ConfigFuente
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		utils.ErrorJSON(w, 400, "JSON inválido")
		return
	}
	if f.EquipoID == 0 || f.Endpoint == "" || f.TipoFuente == "" {
		utils.ErrorJSON(w, 400, "equipo_id, endpoint y tipo_fuente son obligatorios")
		return
	}
	if err := h.Repo.CrearFuente(&f); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 201, f)
}

func (h *ConfigHandler) ListarUmbrales(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	umbrales, err := h.Repo.ListarUmbralesPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if umbrales == nil {
		umbrales = []models.ConfigUmbral{}
	}
	utils.SuccessJSON(w, 200, umbrales)
}

func (h *ConfigHandler) ListarFuentes(w http.ResponseWriter, r *http.Request) {
	fuentes, err := h.Repo.ListarFuentes()
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if fuentes == nil {
		fuentes = []models.ConfigFuente{}
	}
	utils.SuccessJSON(w, 200, fuentes)
}

func (h *ConfigHandler) ObtenerFuente(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	fuente, err := h.Repo.ObtenerFuentePorID(id)
	if err != nil {
		utils.ErrorJSON(w, 404, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, fuente)
}

func (h *ConfigHandler) ActualizarFuente(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var f models.ConfigFuente
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		utils.ErrorJSON(w, 400, "JSON inválido")
		return
	}
	if err := h.Repo.ActualizarFuente(id, &f); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Fuente actualizada"})
}

func (h *ConfigHandler) EliminarFuente(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Repo.EliminarFuente(id); err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	utils.SuccessJSON(w, 200, map[string]string{"mensaje": "Fuente eliminada"})
}

func (h *ConfigHandler) ListarFuentesPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	fuentes, err := h.Repo.ListarFuentesPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if fuentes == nil {
		fuentes = []models.ConfigFuente{}
	}
	utils.SuccessJSON(w, 200, fuentes)
}
