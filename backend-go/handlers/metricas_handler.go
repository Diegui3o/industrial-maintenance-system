package handlers

import (
	"encoding/json"
	"net/http"

	"backend/services"
)

type MetricaHandler struct {
	Service *services.MetricaService
}

type RequestMetrica struct {
	EquipoID int     `json:"equipo_id"`
	Tipo     string  `json:"tipo"`
	Valor    float64 `json:"valor"`
}

func (h *MetricaHandler) CrearMetrica(w http.ResponseWriter, r *http.Request) {
	var req RequestMetrica

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	err = h.Service.RegistrarMetrica(req.EquipoID, req.Tipo, req.Valor)
	if err != nil {
		http.Error(w, "Error al guardar métrica", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Métrica registrada"))
}
