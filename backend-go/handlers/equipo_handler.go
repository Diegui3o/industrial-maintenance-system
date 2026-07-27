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

type EquipoHandler struct {
	Service *services.EquipoService
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

	equipos, err := h.Service.ListarEquipos(
		filtros,
		page,
		limit,
		sort,
		order,
	)

	if err != nil {
		utils.ErrorJSON(w, 500, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, equipos)
}

func (h *EquipoHandler) PostEquipos(
	w http.ResponseWriter,
	r *http.Request,
) {

	var e models.Equipo

	err := json.NewDecoder(r.Body).Decode(&e)

	if err != nil {
		utils.ErrorJSON(w, 400, "JSON inválido")
		return
	}

	err = h.Service.CrearEquipos(e)

	if err != nil {
		utils.ErrorJSON(w, 500, "No se pudo crear equipo")
		return
	}

	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]string{
		"mensaje": "Equipo creado",
	})
}

func (h *EquipoHandler) GetEquipoPorID(
	w http.ResponseWriter,
	r *http.Request,
) {

	vars := mux.Vars(r)

	id, err := strconv.Atoi(vars["id"])

	if err != nil {
		utils.ErrorJSON(w, 400, "id invalido")
		return
	}

	equipo, err := h.Service.BuscarEquipoPorID(id)

	if err != nil {
		utils.ErrorJSON(w, 500, "error buscando equipo")
		return
	}

	json.NewEncoder(w).Encode(equipo)

}

func (h *EquipoHandler) UpdateEquipos(
	w http.ResponseWriter,
	r *http.Request,
) {

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

	json.NewEncoder(w).Encode(map[string]string{
		"mensaje": "Equipo actualizado correctamente",
	})

}
