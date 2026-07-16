// services/usuario_service.go
package services

import (
	"backend/models"
	"backend/repository"
)

type UsuarioService struct {
	Repo *repository.UsuarioRepository
}

func (s *UsuarioService) Crear(u *models.Usuario) error {
	return s.Repo.Crear(u)
}

func (s *UsuarioService) Listar() ([]models.Usuario, error) {
	return s.Repo.Listar()
}

func (s *UsuarioService) ObtenerPorID(id int) (*models.Usuario, error) {
	return s.Repo.ObtenerPorID(id)
}
