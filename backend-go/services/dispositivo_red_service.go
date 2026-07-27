// services/dispositivo_red_service.go
package services

import (
	"backend/models"
	"backend/repository"
)

type DispositivoRedService struct {
	Repo *repository.DispositivoRedRepository
}

func (s *DispositivoRedService) Crear(d *models.DispositivoRed) error {
	_, err := s.Repo.Crear(d)
	return err
}

func (s *DispositivoRedService) ListarTodos() ([]models.DispositivoRed, error) {
	return s.Repo.ListarTodos()
}

func (s *DispositivoRedService) ListarPorEquipo(equipoID int) ([]models.DispositivoRed, error) {
	return s.Repo.ListarPorEquipo(equipoID)
}

func (s *DispositivoRedService) ObtenerPorID(id int) (*models.DispositivoRed, error) {
	return s.Repo.ObtenerPorID(id)
}

func (s *DispositivoRedService) Actualizar(id int, d *models.DispositivoRed) error {
	return s.Repo.Actualizar(id, d)
}

func (s *DispositivoRedService) Eliminar(id int) error {
	return s.Repo.Eliminar(id)
}
