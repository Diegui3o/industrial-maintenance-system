package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend/models"

	"github.com/gorilla/mux"
)

func (h *EstructuraPlantaHandler) ListarSubcomponentes(
	w http.ResponseWriter,
	r *http.Request,
) {
	componenteID, err := strconv.Atoi(
		mux.Vars(r)["componente_id"],
	)
	if err != nil {
		http.Error(w, "ID de componente inv├ílido", http.StatusBadRequest)
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
		http.Error(w, "Datos inv├ílidos", http.StatusBadRequest)
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
		http.Error(w, "ID inv├ílido", http.StatusBadRequest)
		return
	}

	var item models.SubcomponenteEquipo

	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, "Datos inv├ílidos", http.StatusBadRequest)
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
			"ID de subcomponente inv├ílido",
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
			"ID de subcomponente inv├ílido",
			http.StatusBadRequest,
		)
		return
	}

	var datos struct {
		RepuestoID int     `json:"repuesto_id"`
		Cantidad   float64 `json:"cantidad"`
		Posicion   *string `json:"posicion,omitempty"`
		Notas      *string `json:"notas,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&datos); err != nil {
		http.Error(
			w,
			"Datos inv├ílidos",
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
