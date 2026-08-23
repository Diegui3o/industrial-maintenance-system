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
	Service            *services.EquipoService
	ConfigRepo         *repository.ConfigRepository
	TagDescubiertoRepo *repository.TagDescubiertoRepository
}

func NewEquipoHandler(
	service *services.EquipoService,
	configRepo *repository.ConfigRepository,
	tagDescubiertoRepo *repository.TagDescubiertoRepository,
) *EquipoHandler {
	return &EquipoHandler{
		Service:            service,
		ConfigRepo:         configRepo,
		TagDescubiertoRepo: tagDescubiertoRepo,
	}
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

func (h *EquipoHandler) ListarCriticos(w http.ResponseWriter, r *http.Request) {
	equipos, err := h.Service.ListarCriticos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}
	if equipos == nil {
		equipos = []models.Equipo{}
	}
	utils.SuccessJSON(w, http.StatusOK, equipos)
}

func (h *EquipoHandler) GetTagsByEquipo(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	// Usar ConfigRepo que ya tiene acceso a DB
	rows, err := h.ConfigRepo.DB.Query(`
		SELECT DISTINCT parametro, unidad 
		FROM datos_sensores 
		WHERE equipo_id = $1
		ORDER BY parametro
	`, id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error obteniendo tags")
		return
	}
	defer rows.Close()

	var tags []map[string]string
	for rows.Next() {
		var parametro, unidad string
		if err := rows.Scan(&parametro, &unidad); err != nil {
			continue
		}
		tags = append(tags, map[string]string{
			"parametro": parametro,
			"unidad":    unidad,
		})
	}

	if err := rows.Err(); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error iterando resultados")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, tags)
}

func (h *EquipoHandler) CrearEquipoConTags(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Equipo models.Equipo `json:"equipo"`
		TagIDs []int         `json:"tagIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido: "+err.Error())
		return
	}

	// Validar equipo
	if req.Equipo.Codigo == "" || req.Equipo.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "Código y nombre son requeridos")
		return
	}

	// Crear equipo
	err := h.Service.CrearEquipos(&req.Equipo)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error creando equipo: "+err.Error())
		return
	}

	// Asignar tags si se proporcionaron
	asignados := 0
	if len(req.TagIDs) > 0 && h.TagDescubiertoRepo != nil {
		asignados, err = h.TagDescubiertoRepo.AsignarTagsAEquipo(req.Equipo.ID, req.TagIDs)
		if err != nil {
			utils.SuccessJSON(w, http.StatusCreated, map[string]interface{}{
				"mensaje":        "Equipo creado, pero hubo error al asignar tags",
				"equipo":         req.Equipo,
				"tags_asignados": 0,
				"error":          err.Error(),
			})
			return
		}
	}

	utils.SuccessJSON(w, http.StatusCreated, map[string]interface{}{
		"mensaje":        "Equipo creado y tags asignados",
		"equipo":         req.Equipo,
		"tags_asignados": asignados,
	})
}
