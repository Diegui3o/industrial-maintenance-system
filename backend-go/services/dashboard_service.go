// services/dashboard_service.go
package services

import (
	"backend/models"
	"backend/repository"
)

type DashboardService struct {
	Repo *repository.DashboardRepository
}

func NewDashboardService(repo *repository.DashboardRepository) *DashboardService {
	return &DashboardService{Repo: repo}
}

func (s *DashboardService) ObtenerResumen() (*models.DashboardResumen, error) {
	return s.Repo.ObtenerResumen()
}
