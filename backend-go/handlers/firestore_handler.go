package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

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
	log.Printf("🔥 FIRESTORE: ListIncidentes llamado a las %s desde %s", time.Now().Format("15:04:05"), r.RemoteAddr)

	ctx := r.Context()
	docs, err := h.Service.ListIncidentes(ctx)
	if err != nil {
		log.Printf("❌ Error listando incidentes: %v", err)
		utils.ErrorJSON(w, 500, "Error listando incidentes")
		return
	}
	log.Printf("✅ ListIncidentes devolvió %d documentos", len(docs))
	utils.SuccessJSON(w, 200, docs)
}

func (h *FirestoreHandler) ListarRequerimientos(w http.ResponseWriter, r *http.Request) {
	log.Printf("🔥 FIRESTORE: ListarRequerimientos llamado a las %s desde %s", time.Now().Format("15:04:05"), r.RemoteAddr)

	requerimientos, err := h.Service.ListarRequerimientos(r.Context())
	if err != nil {
		log.Printf("❌ Error listando requerimientos: %v", err)
		utils.ErrorJSON(w, http.StatusInternalServerError, "Error al listar requerimientos")
		return
	}
	log.Printf("✅ ListarRequerimientos devolvió %d documentos", len(requerimientos))
	if requerimientos == nil {
		requerimientos = []models.Requerimiento{}
	}
	utils.SuccessJSON(w, http.StatusOK, requerimientos)
}

// CrearDocumento: POST /api/firestore/{collection}
func (h *FirestoreHandler) CrearDocumento(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	collection := vars["collection"]

	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	docRef, _, err := h.Service.CrearDocumento(r.Context(), collection, data)
	if err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusCreated, map[string]string{
		"id":      docRef.ID,
		"mensaje": "Documento creado",
	})
}

// ActualizarDocumento: PUT /api/firestore/{collection}/{id}
func (h *FirestoreHandler) ActualizarDocumento(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	collection := vars["collection"]
	id := vars["id"]

	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		utils.ErrorJSON(w, http.StatusBadRequest, "JSON inválido")
		return
	}

	if err := h.Service.ActualizarDocumento(r.Context(), collection, id, data); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Documento actualizado"})
}

// EliminarDocumento: DELETE /api/firestore/{collection}/{id}
func (h *FirestoreHandler) EliminarDocumento(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	collection := vars["collection"]
	id := vars["id"]

	if err := h.Service.EliminarDocumento(r.Context(), collection, id); err != nil {
		utils.ErrorJSON(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessJSON(w, http.StatusOK, map[string]string{"mensaje": "Documento eliminado"})
}
