package handlers

import (
	"encoding/json"
	"net/http"

	"backend/models"
	"backend/services"
	"backend/utils"

	"github.com/gorilla/mux"
)

type FirestoreHandler struct {
	Service *services.FirestoreService
}

func NewFirestoreHandler(
	service *services.FirestoreService,
) *FirestoreHandler {
	return &FirestoreHandler{
		Service: service,
	}
}

func (h *FirestoreHandler) GetDocument(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)

	collection := vars["collection"]
	documentID := vars["documentID"]

	data, err := h.Service.GetDocument(
		r.Context(),
		collection,
		documentID,
	)

	if err != nil {
		http.Error(
			w,
			"Error obteniendo documento de Firestore: "+err.Error(),
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(data)
}

func (h *FirestoreHandler) ListIncidentes(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	docs, err := h.Service.ListIncidentes(ctx)
	if err != nil {
		utils.ErrorJSON(w, 500, "Error listando incidentes")
		return
	}
	utils.SuccessJSON(w, 200, docs)
}

func (h *FirestoreHandler) ListarRequerimientos(w http.ResponseWriter, r *http.Request) {
	requerimientos, err := h.Service.ListarRequerimientos(r.Context()) // ← Service
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar requerimientos")
		return
	}
	if requerimientos == nil {
		requerimientos = []models.Requerimiento{}
	}
	utils.SuccessJSON(w, http.StatusOK, requerimientos)
}
