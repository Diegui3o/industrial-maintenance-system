package services

import (
	"context"

	"backend/models"
	"backend/repository"

	"cloud.google.com/go/firestore"
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

func (s *FirestoreService) ListarRequerimientos(ctx context.Context) ([]models.Requerimiento, error) {
	return s.Repo.ListarRequerimientos(ctx)
}

func (s *FirestoreService) CrearDocumento(ctx context.Context, collection string, data map[string]interface{}) (*firestore.DocumentRef, *firestore.WriteResult, error) {
	return s.Repo.CrearDocumento(ctx, collection, data)
}

func (s *FirestoreService) ActualizarDocumento(ctx context.Context, collection, id string, data map[string]interface{}) error {
	return s.Repo.ActualizarDocumento(ctx, collection, id, data)
}

func (s *FirestoreService) EliminarDocumento(ctx context.Context, collection, id string) error {
	return s.Repo.EliminarDocumento(ctx, collection, id)
}
