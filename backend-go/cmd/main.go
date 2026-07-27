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

	sched, ruleEngine := core.InitScheduler(db)
	go sched.Start()

	r := routes.SetupRoutes(db, ruleEngine)

	log.Println("🚀 Servidor corriendo en :1880")
	log.Fatal(http.ListenAndServe("0.0.0.0:1880", r))
}
