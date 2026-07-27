package services

import "backend/repository"

type MetricaService struct {
	Repo *repository.MetricaRepository
}

func (s *MetricaService) RegistrarMetrica(equipoID int, tipo string, valor float64) error {
	return s.Repo.InsertarMetrica(equipoID, tipo, valor)
}
