package routes

import (
	"backend/handlers"

	"github.com/gorilla/mux"
)

func registrarFirestoreRoutes(
	r *mux.Router,
	firestoreHandler *handlers.FirestoreHandler,
) {
	r.HandleFunc("/api/incidentes", firestoreHandler.ListIncidentes).Methods("GET")
	r.HandleFunc("/api/requerimientos", firestoreHandler.ListarRequerimientos).Methods("GET")
	r.HandleFunc("/api/firestore/{collection}", firestoreHandler.CrearDocumento).Methods("POST")
	r.HandleFunc("/api/firestore/{collection}/{id}", firestoreHandler.ActualizarDocumento).Methods("PUT")
	r.HandleFunc("/api/firestore/{collection}/{id}", firestoreHandler.EliminarDocumento).Methods("DELETE")
	r.HandleFunc(
		"/api/firestore/{collection}/{documentID}",
		firestoreHandler.GetDocument,
	).Methods("GET")
}
