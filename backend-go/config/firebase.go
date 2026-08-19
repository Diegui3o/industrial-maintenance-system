package config

import (
	"context"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

// ConnectFirestore crea una conexión reutilizable con Firestore.
//
// Variables de entorno:
//
// FIREBASE_PROJECT_ID
// GOOGLE_APPLICATION_CREDENTIALS
//
// Ejemplo:
//
// FIREBASE_PROJECT_ID=mi-proyecto
// GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/firebase.json
//
// En desarrollo local también puede apuntar a una ruta de Windows.
func ConnectFirestore() *firestore.Client {
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	credentialsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	if projectID == "" {
		log.Fatal("FIREBASE_PROJECT_ID no está configurado")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	var (
		client *firestore.Client
		err    error
	)

	if credentialsFile != "" {
		client, err = firestore.NewClient(
			ctx,
			projectID,
			option.WithCredentialsFile(credentialsFile),
		)
	} else {
		// Permite utilizar Application Default Credentials.
		client, err = firestore.NewClient(
			ctx,
			projectID,
		)
	}

	if err != nil {
		log.Fatalf("Error conectando con Firestore: %v", err)
	}

	log.Println("Firestore conectado correctamente")

	return client
}
