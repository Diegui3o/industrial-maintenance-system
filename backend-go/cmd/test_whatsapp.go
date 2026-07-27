package main

import (
	"backend/config"
	"backend/repository"
	"backend/whatsapp"
	"log"
	"time"
)

func main() {

	db := config.ConnectDB()

	defer db.Close()

	repo := repository.NewWhatsAppRepository(db)

	instancia, err := repo.ObtenerInstancia(1)

	if err != nil {
		log.Fatal(err)
	}

	client := whatsapp.NewWhatsAppClient()

	log.Println("Conectando:", instancia.Nombre)

	err = client.Connect(
		instancia.RutaSesion,
	)

	if err != nil {
		log.Fatal(err)
	}

	log.Println("✅ Conectado!")
	time.Sleep(5 * time.Second)

	groups, err := client.GetGroups()

	if err != nil {
		log.Fatal(err)
	}

	for _, g := range groups {
		log.Printf(
			"📱 %s | JID: %s",
			g.Name,
			g.JID,
		)
	}

	grupoPrueba := "120363428461703924@g.us"

	err = client.SendToGroup(
		grupoPrueba,
		"hola",
	)

	if err != nil {
		log.Println("Error enviando:", err)
	} else {
		log.Println("✅ Mensaje enviado correctamente")
	}

	client.Disconnect()
}
