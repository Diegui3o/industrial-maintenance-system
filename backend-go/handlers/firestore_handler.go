package handlers

import (
	"encoding/json"
	"net/http"

	"backend/services"

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
