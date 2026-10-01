package services

import (
    "backend/models"
    "backend/repository"
)

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

func (s *EstructuraPlantaService) ListarMasterGeneral() ([]models.MaestroGeneralItem, error) {
    return s.Repo.ListarMasterGeneral()
}