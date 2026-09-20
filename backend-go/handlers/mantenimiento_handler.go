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

type MantenimientoHandler struct {
	Repo *repository.MantenimientoRepository
}

func NewMantenimientoHandler(repo *repository.MantenimientoRepository) *MantenimientoHandler {
	return &MantenimientoHandler{Repo: repo}
}

func (h *MantenimientoHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var m models.Mantenimiento

	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	id, err := h.Repo.Crear(&m)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	m.ID = id
	utils.SuccessJSON(w, http.StatusCreated, m)
}

func (h *MantenimientoHandler) Obtener(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	m, err := h.Repo.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if m == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "mantenimiento no encontrado")
		return
	}

	utils.SuccessJSON(w, http.StatusOK, m)
}

func (h *MantenimientoHandler) ListarPorEquipo(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	lista, err := h.Repo.ListarPorEquipo(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if lista == nil {
		lista = []models.Mantenimiento{}
	}

	utils.SuccessJSON(w, http.StatusOK, lista)
}

func (h *MantenimientoHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	var nuevo models.Mantenimiento

	if err := json.NewDecoder(r.Body).Decode(&nuevo); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON invalido")
		return
	}

	anterior, err := h.Repo.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if anterior == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "mantenimiento no encontrado")
		return
	}

	if err := h.Repo.Actualizar(id, nuevo); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	detalleRepo := repository.NewMantenimientoDetalleRepository(h.Repo.DB)

	var estadoAnterior *string
	var estadoNuevo *string

	if anterior.EstadoFalla != nuevo.EstadoFalla {
		estadoAnterior = &anterior.EstadoFalla
		estadoNuevo = &nuevo.EstadoFalla
	}

	var porcentajeAnterior *float64
	var porcentajeNuevo *float64

	if anterior.PorcentajeAvance != nil &&
		nuevo.PorcentajeAvance != nil &&
		*anterior.PorcentajeAvance != *nuevo.PorcentajeAvance {

		porcentajeAnterior = anterior.PorcentajeAvance
		porcentajeNuevo = nuevo.PorcentajeAvance
	}

	tipoEvento := "actualizacion"

	if estadoAnterior != nil {
		tipoEvento = "cambio_estado"
	} else if porcentajeAnterior != nil {
		tipoEvento = "avance"
	}

	descripcion := "Mantenimiento actualizado"

	if estadoAnterior != nil {
		descripcion = "Cambio de estado"
	} else if porcentajeAnterior != nil {
		descripcion = "Actualización de avance"
	}

	_, err = detalleRepo.CrearHistorial(
		id,
		repository.MantenimientoHistorial{
			TipoEvento:         tipoEvento,
			EstadoAnterior:     estadoAnterior,
			EstadoNuevo:        estadoNuevo,
			PorcentajeAnterior: porcentajeAnterior,
			PorcentajeNuevo:    porcentajeNuevo,
			Descripcion:        &descripcion,
			UsuarioID:          nuevo.UsuarioID,
		},
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			"mantenimiento actualizado pero no se pudo registrar el historial",
		)
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]interface{}{
		"mensaje": "Mantenimiento actualizado correctamente",
		"id":      id,
	})
}

// Compatibilidad con las rutas actuales
func (h *MantenimientoHandler) GetPorEquipo(w http.ResponseWriter, r *http.Request) {
	h.ListarPorEquipo(w, r)
}

func (h *MantenimientoHandler) GetPorID(w http.ResponseWriter, r *http.Request) {
	h.Obtener(w, r)
}

func (h *MantenimientoHandler) Update(w http.ResponseWriter, r *http.Request) {
	h.Actualizar(w, r)
}
func (h *MantenimientoHandler) ObtenerCompleto(
	w http.ResponseWriter,
	r *http.Request,
) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "id invalido")
		return
	}

	m, err := h.Repo.ObtenerPorID(id)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	if m == nil {
		utils.ErrorJSON(w, http.StatusNotFound, "mantenimiento no encontrado")
		return
	}

	detalleRepo := repository.NewMantenimientoDetalleRepository(h.Repo.DB)

	completo, err := detalleRepo.ObtenerCompleto(id, m)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, completo)
}
func (h *MantenimientoHandler) ListarTodos(
	w http.ResponseWriter,
	r *http.Request,
) {
	lista, err := h.Repo.ListarTodos()
	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	if lista == nil {
		lista = []models.Mantenimiento{}
	}

	utils.SuccessJSON(
		w,
		http.StatusOK,
		lista,
	)
}
