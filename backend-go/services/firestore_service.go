package services

import (
	"context"

	"backend/models"
	"backend/repository"
)

type FirestoreService struct {
	Repo *repository.FirestoreRepository
}

func NewFirestoreService(
	repo *repository.FirestoreRepository,
) *FirestoreService {
	return &FirestoreService{
		Repo: repo,
	}
}

func (s *FirestoreService) GetDocument(
	ctx context.Context,
	collection string,
	documentID string,
) (map[string]interface{}, error) {

	return s.Repo.GetDocument(
		ctx,
		collection,
		documentID,
	)
}

func (s *FirestoreService) ListIncidentes(ctx context.Context) ([]models.Incidente, error) {
	return s.Repo.ListIncidentes(ctx)
}
