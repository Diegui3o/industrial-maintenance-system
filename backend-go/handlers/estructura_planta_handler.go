package handlers

import "backend/services"

type EstructuraPlantaHandler struct {
	Service *services.EstructuraPlantaService
}

func NewEstructuraPlantaHandler(
	service *services.EstructuraPlantaService,
) *EstructuraPlantaHandler {
	return &EstructuraPlantaHandler{
		Service: service,
	}
}
