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

	r := routes.SetupRoutes(db)

	sched := core.InitScheduler(db)
	go sched.Start()

	log.Println("Servidor corriendo en :1880")
	log.Fatal(http.ListenAndServe(":1880", r))
}
