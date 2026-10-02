package handlers

import (
	"database/sql"

	"backend/services"
)

type EstructuraPlantaHandler struct {
	Service *services.EstructuraPlantaService
	DB      *sql.DB
}

func NewEstructuraPlantaHandler(
	service *services.EstructuraPlantaService,
	db *sql.DB,
) *EstructuraPlantaHandler {
	return &EstructuraPlantaHandler{
		Service: service,
		DB:      db,
	}
}