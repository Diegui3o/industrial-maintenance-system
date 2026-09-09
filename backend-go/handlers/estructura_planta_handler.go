package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type EstructuraPlantaHandler struct {
	Service *services.EstructuraPlantaService
}

func NewEstructuraPlantaHandler(
	service *services.EstructuraPlantaService,
) *EstructuraPlantaHandler {
	return &EstructuraPlantaHandler{
		Service: service,
	}
}

// ==================== PROCESOS ====================

func (h *EstructuraPlantaHandler) GetProcesos(w http.ResponseWriter, r *http.Request) {
	procesos, err := h.Service.ListarProcesos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if procesos == nil {
		procesos = []models.ProcesoPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, procesos)
}

func (h *EstructuraPlantaHandler) PostProceso(w http.ResponseWriter, r *http.Request) {
	var p models.ProcesoPlanta

	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if p.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearProceso(&p); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, p)
}

// ==================== SUBPROCESOS ====================

func (h *EstructuraPlantaHandler) GetSubprocesos(w http.ResponseWriter, r *http.Request) {
	procesoID, err := strconv.Atoi(mux.Vars(r)["proceso_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id invalido")
		return
	}

	subprocesos, err := h.Service.ListarSubprocesos(procesoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if subprocesos == nil {
		subprocesos = []models.SubprocesoPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, subprocesos)
}

func (h *EstructuraPlantaHandler) PostSubproceso(w http.ResponseWriter, r *http.Request) {
	var s models.SubprocesoPlanta

	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.ProcesoID <= 0 || s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id y nombre son requeridos")
		return
	}

	if err := h.Service.CrearSubproceso(&s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, s)
}

// ==================== EQUIPO → SUBPROCESO ====================

func (h *EstructuraPlantaHandler) PostEquipoSubproceso(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SubprocesoID int `json:"subproceso_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SubprocesoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id requerido")
		return
	}

	if err := h.Service.AsignarEquipoSubproceso(
		equipoID,
		req.SubprocesoID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id":     equipoID,
		"subproceso_id": req.SubprocesoID,
	})
}

func (h *EstructuraPlantaHandler) GetEquipoSubproceso(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	resultado, err := h.Service.ObtenerSubprocesoEquipo(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusNotFound, "equipo sin subproceso asignado")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, resultado)
}

// ==================== CLASIFICACIONES ====================

func (h *EstructuraPlantaHandler) GetClasificaciones(w http.ResponseWriter, r *http.Request) {
	clasificaciones, err := h.Service.ListarClasificaciones()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if clasificaciones == nil {
		clasificaciones = []models.ClasificacionPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, clasificaciones)
}

func (h *EstructuraPlantaHandler) PostClasificacion(w http.ResponseWriter, r *http.Request) {
	var c models.ClasificacionPlanta

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearClasificacion(&c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, c)
}

func (h *EstructuraPlantaHandler) PostEquipoClasificacion(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		ClasificacionID int `json:"clasificacion_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.ClasificacionID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "clasificacion_id requerido")
		return
	}

	if err := h.Service.AsignarClasificacion(
		equipoID,
		req.ClasificacionID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id":       equipoID,
		"clasificacion_id": req.ClasificacionID,
	})
}

// ==================== SISTEMAS ====================

func (h *EstructuraPlantaHandler) GetSistemas(w http.ResponseWriter, r *http.Request) {
	sistemas, err := h.Service.ListarSistemas()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if sistemas == nil {
		sistemas = []models.SistemaPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, sistemas)
}

func (h *EstructuraPlantaHandler) PostSistema(w http.ResponseWriter, r *http.Request) {
	var s models.SistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearSistema(&s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, s)
}

func (h *EstructuraPlantaHandler) PostEquipoSistema(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SistemaID int `json:"sistema_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SistemaID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "sistema_id requerido")
		return
	}

	if err := h.Service.AsignarSistema(
		equipoID,
		req.SistemaID,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"equipo_id": equipoID,
		"sistema_id": req.SistemaID,
	})
}

// ==================== COMPONENTES ====================

func (h *EstructuraPlantaHandler) GetComponentes(w http.ResponseWriter, r *http.Request) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	componentes, err := h.Service.ListarComponentes(equipoID)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if componentes == nil {
		componentes = []models.ComponenteEquipo{}
	}

	utils.SuccessJSON(w, http.StatusOK, componentes)
}

func (h *EstructuraPlantaHandler) PostComponente(w http.ResponseWriter, r *http.Request) {
	var c models.ComponenteEquipo

	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.EquipoID <= 0 || c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id y nombre son requeridos")
		return
	}

	if err := h.Service.CrearComponente(&c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, c)
}

// ==================== REPUESTOS ====================

func (h *EstructuraPlantaHandler) GetRepuestos(w http.ResponseWriter, r *http.Request) {
	repuestos, err := h.Service.ListarRepuestos()
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if repuestos == nil {
		repuestos = []models.Repuesto{}
	}

	utils.SuccessJSON(w, http.StatusOK, repuestos)
}

func (h *EstructuraPlantaHandler) PostRepuesto(w http.ResponseWriter, r *http.Request) {
	var rep models.Repuesto

	if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if rep.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.CrearRepuesto(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, rep)
}

func (h *EstructuraPlantaHandler) PostComponenteRepuesto(w http.ResponseWriter, r *http.Request) {
	componenteID, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	var req struct {
		RepuestoID int      `json:"repuesto_id"`
		Cantidad   float64  `json:"cantidad"`
		Posicion   *string  `json:"posicion"`
		Notas      *string  `json:"notas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.RepuestoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "repuesto_id requerido")
		return
	}

	if req.Cantidad <= 0 {
		req.Cantidad = 1
	}

	if err := h.Service.AsignarRepuestoComponente(
		componenteID,
		req.RepuestoID,
		req.Cantidad,
		req.Posicion,
		req.Notas,
	); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"componente_id": componenteID,
		"repuesto_id":   req.RepuestoID,
		"cantidad":      req.Cantidad,
	})
}
// ==================== ACTUALIZAR ====================

func (h *EstructuraPlantaHandler) PutProceso(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var p models.ProcesoPlanta
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if p.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarProceso(id, p); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Proceso actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutSubproceso(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var s models.SubprocesoPlanta
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.ProcesoID <= 0 || s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "proceso_id y nombre son requeridos")
		return
	}

	if err := h.Service.ActualizarSubproceso(id, s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Subproceso actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutClasificacion(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var c models.ClasificacionPlanta
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarClasificacion(id, c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Clasificacion actualizada correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutSistema(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var s models.SistemaPlanta
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if s.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarSistema(id, s); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Sistema actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutComponente(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var c models.ComponenteEquipo
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if c.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarComponente(id, c); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Componente actualizado correctamente",
		"id":      id,
	})
}

func (h *EstructuraPlantaHandler) PutRepuesto(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var rep models.Repuesto
	if err := json.NewDecoder(r.Body).Decode(&rep); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if rep.Nombre == "" {
		utils.ErrorJSON(w, http.StatusBadRequest, "nombre requerido")
		return
	}

	if err := h.Service.ActualizarRepuesto(id, rep); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Repuesto actualizado correctamente",
		"id":      id,
	})
}
// ==================== ACTUALIZAR RELACIONES ====================

func (h *EstructuraPlantaHandler) PutEquipoSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		SubprocesoID int `json:"subproceso_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	if req.SubprocesoID <= 0 {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id requerido")
		return
	}

	err = h.Service.ActualizarEquipoSubproceso(
		equipoID,
		req.SubprocesoID,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":       "Subproceso del equipo actualizado correctamente",
		"equipo_id":     equipoID,
		"subproceso_id": req.SubprocesoID,
	})
}

func (h *EstructuraPlantaHandler) PutEquipoClasificaciones(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		Clasificaciones []int `json:"clasificaciones"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarEquipoClasificaciones(
		equipoID,
		req.Clasificaciones,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":        "Clasificaciones del equipo actualizadas correctamente",
		"equipo_id":      equipoID,
		"clasificaciones": req.Clasificaciones,
	})
}

func (h *EstructuraPlantaHandler) PutEquipoSistemas(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	var req struct {
		Sistemas []int `json:"sistemas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarEquipoSistemas(
		equipoID,
		req.Sistemas,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":  "Sistemas del equipo actualizados correctamente",
		"equipo_id": equipoID,
		"sistemas": req.Sistemas,
	})
}

func (h *EstructuraPlantaHandler) PutComponenteRepuestos(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	var req struct {
		Repuestos []int `json:"repuestos"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	err = h.Service.ActualizarComponenteRepuestos(
		componenteID,
		req.Repuestos,
	)

	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":   "Repuestos del componente actualizados correctamente",
		"componente_id": componenteID,
		"repuestos": req.Repuestos,
	})
}
// ==================== CONSULTAR RELACIONES ====================

func (h *EstructuraPlantaHandler) GetEquiposPorSubproceso(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["subproceso_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "subproceso_id invalido")
		return
	}

	lista, err := h.Service.ListarEquiposPorSubproceso(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.PlantaEquipo{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) GetClasificacionesPorEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	lista, err := h.Service.ListarClasificacionesPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.ClasificacionPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) GetSistemasPorEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "equipo_id invalido")
		return
	}

	lista, err := h.Service.ListarSistemasPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.SistemaPlanta{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *EstructuraPlantaHandler) GetRepuestosPorComponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "componente_id invalido")
		return
	}

	lista, err := h.Service.ListarRepuestosPorComponente(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.Repuesto{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}
func (h *EstructuraPlantaHandler) GetEquipoPlantaDetalle(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["equipo_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"equipo_id invalido",
		)
		return
	}

	detalle, err := h.Service.ObtenerEquipoPlantaDetalle(id)
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	utils.SuccessJSON(
		w,
		http.StatusOK,
		detalle,
	)
}
func (h *EstructuraPlantaHandler) GetRepuestosDetallePorComponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["componente_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"componente_id invalido",
		)
		return
	}

	lista, err := h.Service.ListarRepuestosDetallePorComponente(id)
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	if lista == nil {
		lista = []models.ComponenteRepuestoDetalle{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}
func (h *EstructuraPlantaHandler) PutComponenteRepuesto(
	w http.ResponseWriter,
	r *http.Request,
) {
	vars := mux.Vars(r)

	componenteID, err := strconv.Atoi(vars["componente_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"componente_id invalido",
		)
		return
	}

	repuestoID, err := strconv.Atoi(vars["repuesto_id"])
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"repuesto_id invalido",
		)
		return
	}

	var req struct {
		Cantidad float64  `json:"cantidad"`
		Posicion *string  `json:"posicion"`
		Notas    *string  `json:"notas"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"JSON invalido",
		)
		return
	}

	if req.Cantidad <= 0 {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"cantidad debe ser mayor que cero",
		)
		return
	}

	err = h.Service.ActualizarComponenteRepuesto(
		componenteID,
		repuestoID,
		req.Cantidad,
		req.Posicion,
		req.Notas,
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje":       "Repuesto del componente actualizado correctamente",
		"componente_id": componenteID,
		"repuesto_id":   repuestoID,
	})
}
func (h *EstructuraPlantaHandler) ListarEquiposSinUbicar(w http.ResponseWriter, r *http.Request) {
	equipos, err := h.Service.ListarEquiposSinUbicar()
	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos sin ubicar",
			http.StatusInternalServerError,
		)
		return
	}

	if equipos == nil {
		equipos = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(equipos)
}
func (h *EstructuraPlantaHandler) ListarEquiposDisponiblesSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipos, err := h.Service.ListarEquiposDisponiblesSistema()

	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos disponibles para sistemas",
			http.StatusInternalServerError,
		)
		return
	}

	if equipos == nil {
		equipos = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(equipos)
}
func (h *EstructuraPlantaHandler) ListarSubprocesosSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	sistemaID, err := strconv.Atoi(
		mux.Vars(r)["sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de sistema inválido",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err := h.Service.ListarSubprocesosSistema(
		sistemaID,
	)

	if err != nil {
		http.Error(
			w,
			"Error obteniendo subprocesos del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.SubprocesoSistemaPlanta{}
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) CrearSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	var item models.SubprocesoSistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(
			w,
			"Datos inválidos",
			http.StatusBadRequest,
		)
		return
	}

	if item.SistemaID <= 0 || item.Nombre == "" {
		http.Error(
			w,
			"El sistema y nombre son obligatorios",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err :=
		h.Service.CrearSubprocesoSistema(item)

	if err != nil {
		http.Error(
			w,
			"Error creando subproceso del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) ActualizarSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(
		mux.Vars(r)["id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID inválido",
			http.StatusBadRequest,
		)
		return
	}

	var item models.SubprocesoSistemaPlanta

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(
			w,
			"Datos inválidos",
			http.StatusBadRequest,
		)
		return
	}

	item.ID = id

	resultado, err :=
		h.Service.ActualizarSubprocesoSistema(item)

	if err != nil {
		http.Error(
			w,
			"Error actualizando subproceso del sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	json.NewEncoder(w).Encode(resultado)
}
func (h *EstructuraPlantaHandler) ListarSubcomponentes(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(
		mux.Vars(r)["componente_id"],
	)
	if err != nil {
		http.Error(w, "ID de componente inválido", http.StatusBadRequest)
		return
	}

	resultado, err := h.Service.ListarSubcomponentes(componenteID)
	if err != nil {
		http.Error(
			w,
			"Error obteniendo subcomponentes",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.SubcomponenteEquipo{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) CrearSubcomponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	var item models.SubcomponenteEquipo

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	if item.ComponenteID <= 0 || item.Nombre == "" {
		http.Error(
			w,
			"El componente y nombre son obligatorios",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err := h.Service.CrearSubcomponente(item)
	if err != nil {
		http.Error(
			w,
			"Error creando subcomponente",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) ActualizarSubcomponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var item models.SubcomponenteEquipo

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}

	item.ID = id

	resultado, err := h.Service.ActualizarSubcomponente(item)
	if err != nil {
		http.Error(
			w,
			"Error actualizando subcomponente",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}
func (h *EstructuraPlantaHandler) ListarRepuestosSubcomponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	subcomponenteID, err := strconv.Atoi(
		mux.Vars(r)["subcomponente_id"],
	)
	if err != nil {
		http.Error(
			w,
			"ID de subcomponente inválido",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err := h.Service.ListarRepuestosSubcomponente(
		subcomponenteID,
	)
	if err != nil {
		http.Error(
			w,
			"Error obteniendo repuestos del subcomponente",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.SubcomponenteRepuestoDetalle{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) AsignarRepuestoSubcomponente(
	w http.ResponseWriter,
	r *http.Request,
) {
	subcomponenteID, err := strconv.Atoi(
		mux.Vars(r)["subcomponente_id"],
	)
	if err != nil {
		http.Error(
			w,
			"ID de subcomponente inválido",
			http.StatusBadRequest,
		)
		return
	}

	var datos struct {
		RepuestoID int      `json:"repuesto_id"`
		Cantidad   float64  `json:"cantidad"`
		Posicion   *string  `json:"posicion,omitempty"`
		Notas      *string  `json:"notas,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&datos); err != nil {
		http.Error(
			w,
			"Datos inválidos",
			http.StatusBadRequest,
		)
		return
	}

	if datos.RepuestoID <= 0 {
		http.Error(
			w,
			"El repuesto es obligatorio",
			http.StatusBadRequest,
		)
		return
	}

	if datos.Cantidad <= 0 {
		http.Error(
			w,
			"La cantidad debe ser mayor que cero",
			http.StatusBadRequest,
		)
		return
	}

	err = h.Service.AsignarRepuestoSubcomponente(
		subcomponenteID,
		datos.RepuestoID,
		datos.Cantidad,
		datos.Posicion,
		datos.Notas,
	)

	if err != nil {
		http.Error(
			w,
			"Error asignando repuesto al subcomponente",
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
func (h *EstructuraPlantaHandler) ListarEquiposPorSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoSistemaID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de subproceso de sistema inválido",
			http.StatusBadRequest,
		)
		return
	}

	resultado, err :=
		h.Service.ListarEquiposPorSubprocesoSistema(
			subprocesoSistemaID,
		)

	if err != nil {
		http.Error(
			w,
			"Error obteniendo equipos del subproceso de sistema",
			http.StatusInternalServerError,
		)
		return
	}

	if resultado == nil {
		resultado = []models.Equipo{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resultado)
}

func (h *EstructuraPlantaHandler) AsignarEquipoSubprocesoSistema(
	w http.ResponseWriter,
	r *http.Request,
) {
	subprocesoSistemaID, err := strconv.Atoi(
		mux.Vars(r)["subproceso_sistema_id"],
	)

	if err != nil {
		http.Error(
			w,
			"ID de subproceso de sistema inválido",
			http.StatusBadRequest,
		)
		return
	}

	var datos struct {
		EquipoID int `json:"equipo_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&datos); err != nil {
		http.Error(
			w,
			"Datos inválidos",
			http.StatusBadRequest,
		)
		return
	}

	if datos.EquipoID <= 0 {
		http.Error(
			w,
			"El equipo es obligatorio",
			http.StatusBadRequest,
		)
		return
	}

	err = h.Service.AsignarEquipoSubprocesoSistema(
		datos.EquipoID,
		subprocesoSistemaID,
	)

	if err != nil {
		http.Error(
			w,
			"Error asignando equipo al subproceso de sistema",
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}