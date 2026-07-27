package config

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	connStr := "postgres://admin:admin@localhost:5432/mantenimiento?sslmode=disable"

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error conectando a DB:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("DB no responde:", err)
	}

	log.Println("DB conectada")

	return db
}
