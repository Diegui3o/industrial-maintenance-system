package services

import "backend/repository"

type EstructuraPlantaService struct {
        Repo *repository.EstructuraPlantaRepository
}

func NewEstructuraPlantaService(
        repo *repository.EstructuraPlantaRepository,
) *EstructuraPlantaService {
        return &EstructuraPlantaService{
                Repo: repo,
        }
}
