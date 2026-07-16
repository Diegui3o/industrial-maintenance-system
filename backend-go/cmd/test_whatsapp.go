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

	if len(groups) > 0 {

		err := client.SendToGroup(
			groups[0].JID.String(),
			"🚨 Prueba desde Bot Mantenimiento",
		)

		if err != nil {
			log.Println(err)
		}

		log.Println("✅ Enviado!")
	}

	client.Disconnect()
}
