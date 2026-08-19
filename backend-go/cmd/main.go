// cmd/main.go
package main

import (
	"log"
	"net/http"

	"backend/config"
	"backend/core"
	"backend/routes"
)

func main() {
	db := config.ConnectDB()

	firestoreClient := config.ConnectFirestore()
	defer firestoreClient.Close()

	sched, ruleEngine, whatsappManager := core.InitScheduler(db)
	go sched.Start()

	r := routes.SetupRoutes(
		db,
		ruleEngine,
		sched,
		whatsappManager,
		firestoreClient,
	)

	log.Println("🚀 Servidor corriendo en :1883")
	log.Fatal(http.ListenAndServe("0.0.0.0:1883", r))
}
