package services

import (
	"context"
	"errors"
	"fmt"

	"backend/models"
	"backend/repository"
)

type IncidenteService struct {
	repo repository.IncidenteRepository
}

func NewIncidenteService(
	repo repository.IncidenteRepository,
) *IncidenteService {
	return &IncidenteService{
		repo: repo,
	}
}

func (s *IncidenteService) List(
	ctx context.Context,
	limit int,
) ([]models.Incidente, error) {

	return s.repo.List(ctx, limit)
}

func (s *IncidenteService) Get(
	ctx context.Context,
	id string,
) (*models.Incidente, error) {

	if id == "" {
		return nil, errors.New("id de incidente requerido")
	}

	return s.repo.Get(ctx, id)
}

func (s *IncidenteService) Create(
	ctx context.Context,
	incidente *models.Incidente,
) (string, error) {

	if incidente == nil {
		return "", errors.New("incidente requerido")
	}

	if incidente.Prioridad == "" {
		incidente.Prioridad = "Media"
	}

	if incidente.Avance < 0 {
		incidente.Avance = 0
	}

	if incidente.Avance > 100 {
		incidente.Avance = 100
	}

	return s.repo.Create(ctx, incidente)
}

func (s *IncidenteService) Update(
	ctx context.Context,
	id string,
	incidente *models.Incidente,
) error {

	if id == "" {
		return errors.New("id de incidente requerido")
	}

	if incidente == nil {
		return errors.New("incidente requerido")
	}

	if incidente.Avance < 0 {
		incidente.Avance = 0
	}

	if incidente.Avance > 100 {
		incidente.Avance = 100
	}

	return s.repo.Update(ctx, id, incidente)
}

func (s *IncidenteService) Delete(
	ctx context.Context,
	id string,
) error {

	if id == "" {
		return errors.New("id de incidente requerido")
	}

	return s.repo.Delete(ctx, id)
}

func IsNotFound(err error) bool {
	return errors.Is(err, repository.ErrIncidenteNoEncontrado)
}

func WrapServiceError(operation string, err error) error {
	return fmt.Errorf("%s: %w", operation, err)
}
