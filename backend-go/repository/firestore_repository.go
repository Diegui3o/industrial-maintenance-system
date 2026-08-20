package repository

import (
	"backend/models"
	"context"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

type FirestoreRepository struct {
	Client *firestore.Client
}

func NewFirestoreRepository(client *firestore.Client) *FirestoreRepository {
	return &FirestoreRepository{
		Client: client,
	}
}

func (r *FirestoreRepository) GetDocument(
	ctx context.Context,
	collection string,
	documentID string,
) (map[string]interface{}, error) {

	docRef := r.Client.
		Collection(collection).
		Doc(documentID)

	docSnap, err := docRef.Get(ctx)
	if err != nil {
		return nil, err
	}

	return docSnap.Data(), nil
}

func (r *FirestoreRepository) ListIncidentes(ctx context.Context) ([]models.Incidente, error) {
	iter := r.Client.Collection("incidentes").Documents(ctx)
	var incidentes []models.Incidente
	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil, err
		}
		var inc models.Incidente
		doc.DataTo(&inc)
		inc.ID = doc.Ref.ID
		incidentes = append(incidentes, inc)
	}
	return incidentes, nil
}

func (r *FirestoreRepository) ListarRequerimientos(ctx context.Context) ([]models.Requerimiento, error) {
	docs, err := r.Client.Collection("requerimientos").Documents(ctx).GetAll() // ← Client
	if err != nil {
		return nil, err
	}

	var requerimientos []models.Requerimiento
	for _, doc := range docs {
		var req models.Requerimiento
		if err := doc.DataTo(&req); err != nil {
			continue
		}
		req.ID = doc.Ref.ID
		requerimientos = append(requerimientos, req)
	}

	return requerimientos, nil
}

func (r *FirestoreRepository) CrearDocumento(ctx context.Context, collection string, data map[string]interface{}) (*firestore.DocumentRef, *firestore.WriteResult, error) {
	return r.Client.Collection(collection).Add(ctx, data)
}

func (r *FirestoreRepository) ActualizarDocumento(ctx context.Context, collection, id string, data map[string]interface{}) error {
	_, err := r.Client.Collection(collection).Doc(id).Set(ctx, data, firestore.MergeAll)
	return err
}

func (r *FirestoreRepository) EliminarDocumento(ctx context.Context, collection, id string) error {
	_, err := r.Client.Collection(collection).Doc(id).Delete(ctx)
	return err
}
