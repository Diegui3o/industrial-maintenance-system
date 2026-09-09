package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"backend/models"
	"backend/services"
	"backend/utils"
)

type TipoEquipoHandler struct {
	Service *services.TipoEquipoService
}

func NewTipoEquipoHandler(
	service *services.TipoEquipoService,
) *TipoEquipoHandler {
	return &TipoEquipoHandler{
		Service: service,
	}
}

type crearTipoEquipoRequest struct {
	Codigo      string  `json:"codigo"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion"`
}

type asignarTipoEquipoRequest struct {
	TipoEquipoID int `json:"tipo_equipo_id"`
}

func (h *TipoEquipoHandler) Listar(
	w http.ResponseWriter,
	r *http.Request,
) {
	resultado, err := h.Service.Listar()

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
		resultado,
	)
}

func (h *TipoEquipoHandler) Crear(
	w http.ResponseWriter,
	r *http.Request,
) {
	var req crearTipoEquipoRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"datos inválidos",
		)
		return
	}

	if req.Codigo == "" || req.Nombre == "" {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"codigo y nombre son obligatorios",
		)
		return
	}

	resultado, err := h.Service.Crear(
		models.TipoEquipo{
			Codigo:      req.Codigo,
			Nombre:      req.Nombre,
			Descripcion: req.Descripcion,
			Activo:       true,
		},
	)

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
		http.StatusCreated,
		resultado,
	)
}

func (h *TipoEquipoHandler) Asignar(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(
		mux.Vars(r)["equipo_id"],
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"equipo_id inválido",
		)
		return
	}

	var req asignarTipoEquipoRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"datos inválidos",
		)
		return
	}

	if req.TipoEquipoID <= 0 {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"tipo_equipo_id inválido",
		)
		return
	}

	if err := h.Service.Asignar(
		equipoID,
		req.TipoEquipoID,
	); err != nil {
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
		map[string]interface{}{
			"ok": true,
		},
	)
}

func (h *TipoEquipoHandler) ListarPorEquipo(
	w http.ResponseWriter,
	r *http.Request,
) {
	equipoID, err := strconv.Atoi(
		mux.Vars(r)["equipo_id"],
	)

	if err != nil {
		utils.ErrorJSON(
			w,
			http.StatusBadRequest,
			"equipo_id inválido",
		)
		return
	}

	resultado, err := h.Service.ListarPorEquipo(
		equipoID,
	)

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
		resultado,
	)
}