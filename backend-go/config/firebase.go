package config

import (
	"context"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

// ConnectFirestore intenta conectar con Firestore de forma opcional.
//
// Firebase NO es una dependencia obligatoria del sistema.
// Si no está configurado o no se puede establecer la conexión,
// devuelve nil y el backend continúa funcionando normalmente.
func ConnectFirestore() *firestore.Client {
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	credentialsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")

	// Firebase no está configurado.
	if projectID == "" {
		log.Println("Firestore no configurado. Se continuará sin conexión a Firebase.")
		return nil
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
		client, err = firestore.NewClient(
			ctx,
			projectID,
		)
	}

	if err != nil {
		log.Printf("Firestore no disponible: %v. Se continuará sin conexión a Firebase.", err)
		return nil
	}

	log.Println("Firestore conectado correctamente")

	return client
}

// CloseFirestore cierra el cliente solamente si existe.
func CloseFirestore(client *firestore.Client) {
	if client != nil {
		if err := client.Close(); err != nil {
			log.Printf("Error cerrando Firestore: %v", err)
		}
	}
}