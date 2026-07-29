package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"backend/models"
	"backend/repository"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type EquipoHandler struct {
	Service    *services.EquipoService
	ConfigRepo *repository.ConfigRepository
}

func (h *EquipoHandler) GetEquipos(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	filtros := map[string]string{}
	for key, values := range queryParams {
		if len(values) > 0 {
			filtros[key] = values[0]
		}
	}

	page := 1
	limit := 50
	if r.URL.Query().Get("page") != "" {
		page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	}
	if r.URL.Query().Get("limit") != "" {
		limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))
	}
	sort := r.URL.Query().Get("sort")
	order := r.URL.Query().Get("order")

	equipos, err := h.Service.ListarEquipos(filtros, page, limit, sort, order)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if equipos == nil {
		equipos = []models.Equipo{}
	}
	utils.SuccessJSON(w, http.StatusOK, equipos)
}

func (h *EquipoHandler) PostEquipos(w http.ResponseWriter, r *http.Request) {
	var e models.Equipo
	err := json.NewDecoder(r.Body).Decode(&e)
	if err != nil {
		log.Printf("❌ Error decodificando JSON: %v", err)
		utils.ErrorJSON(w, 400, "JSON inválido")
		return
	}

	log.Printf("📥 Creando equipo: %s", e.Codigo)

	err = h.Service.CrearEquipos(&e)
	if err != nil {
		log.Printf("❌ Error creando equipo: %v", err)
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	log.Printf("📤 Enviando respuesta: ID=%d, Código=%s", e.ID, e.Codigo)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(e)
}

func (h *EquipoHandler) GetEquipoPorID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	equipo, err := h.Service.BuscarEquipoPorID(id)
	if err != nil {
		utils.ErrorJSON(w, 500, "error buscando equipo")
		return
	}

	// Buscar dispositivo de red asociado
	dispositivos, _ := h.Service.Repo.ListarDispositivosPorEquipo(id)
	var dispositivo map[string]interface{}
	if len(dispositivos) > 0 {
		dispositivo = map[string]interface{}{
			"tipo_dispositivo": dispositivos[0].TipoDispositivo,
			"ip":               dispositivos[0].IP,
			"puerto":           dispositivos[0].Puerto,
			"protocolo":        dispositivos[0].Protocolo,
			"usuario_red":      dispositivos[0].Usuario,
			"password_hash":    dispositivos[0].PasswordHash,
		}
	}

	// Buscar fuente ping asociada
	fuentes, _ := h.ConfigRepo.ListarFuentesPorEquipo(id)
	var fuente map[string]interface{}
	for _, f := range fuentes {
		if f.TipoFuente == "ping" {
			fuente = map[string]interface{}{
				"endpoint":           f.Endpoint,
				"intervalo_segundos": f.IntervaloSegundos,
				"timeout_segundos":   f.TimeoutSegundos,
				"reintentos":         f.Reintentos,
			}
			break
		}
	}

	// Respuesta completa
	response := map[string]interface{}{
		"equipo":      equipo,
		"dispositivo": dispositivo,
		"ping":        fuente,
	}

	utils.SuccessJSON(w, 200, response)
}

func (h *EquipoHandler) UpdateEquipos(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.ErrorJSON(w, 400, "id invalido")
		return
	}
	var e models.Equipo
	err = json.NewDecoder(r.Body).Decode(&e)
	if err != nil {
		utils.ErrorJSON(w, 400, "json invalido")
		return
	}
	err = h.Service.ActualizarEquipo(id, e)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"mensaje": "Equipo actualizado correctamente"})
}

func (h *EquipoHandler) GetHijos(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	hijos, err := h.Service.Repo.ListarHijos(id)
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if hijos == nil {
		hijos = []models.Equipo{}
	}
	utils.SuccessJSON(w, 200, hijos)
}

func (h *EquipoHandler) GetRaices(w http.ResponseWriter, r *http.Request) {
	raices, err := h.Service.Repo.ListarRaices()
	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}
	if raices == nil {
		raices = []models.Equipo{}
	}
	utils.SuccessJSON(w, 200, raices)
}
