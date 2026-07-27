package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		connStr = "postgres://admin:admin@localhost:5432/mantenimiento?sslmode=disable"
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error conectando a DB:", err)
	}

	// Reintentar hasta que PostgreSQL esté listo
	for i := 0; i < 30; i++ {
		err = db.Ping()
		if err == nil {
			log.Println("DB conectada")
			return db
		}
		log.Println("Esperando PostgreSQL...")
	}
	log.Fatal("DB no responde:", err)
	return nil
}
