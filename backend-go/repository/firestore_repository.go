package repository

import (
	"backend/models"
	"context"
	"errors"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

var ErrFirestoreNoDisponible = errors.New("Firestore no está disponible")

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

	if r == nil || r.Client == nil {
		return nil, ErrFirestoreNoDisponible
	}

	docRef := r.Client.
		Collection(collection).
		Doc(documentID)

	docSnap, err := docRef.Get(ctx)
	if err != nil {
		return nil, err
	}

	return docSnap.Data(), nil
}

func (r *FirestoreRepository) ListIncidentes(
	ctx context.Context,
) ([]models.Incidente, error) {

	// Firebase es opcional.
	// Si no está disponible, simplemente no hay datos.
	if r == nil || r.Client == nil {
		return []models.Incidente{}, nil
	}

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

		if err := doc.DataTo(&inc); err != nil {
			continue
		}

		inc.ID = doc.Ref.ID

		incidentes = append(incidentes, inc)
	}

	if incidentes == nil {
		incidentes = []models.Incidente{}
	}

	return incidentes, nil
}

func (r *FirestoreRepository) ListarRequerimientos(
	ctx context.Context,
) ([]models.Requerimiento, error) {

	// Firebase es opcional.
	// Si no está disponible, simplemente no hay datos.
	if r == nil || r.Client == nil {
		return []models.Requerimiento{}, nil
	}

	docs, err := r.Client.
		Collection("requerimientos").
		Documents(ctx).
		GetAll()

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

	if requerimientos == nil {
		requerimientos = []models.Requerimiento{}
	}

	return requerimientos, nil
}

func (r *FirestoreRepository) CrearDocumento(
	ctx context.Context,
	collection string,
	data map[string]interface{},
) (*firestore.DocumentRef, *firestore.WriteResult, error) {

	if r == nil || r.Client == nil {
		return nil, nil, ErrFirestoreNoDisponible
	}

	return r.Client.Collection(collection).Add(ctx, data)
}

func (r *FirestoreRepository) ActualizarDocumento(
	ctx context.Context,
	collection string,
	id string,
	data map[string]interface{},
) error {

	if r == nil || r.Client == nil {
		return ErrFirestoreNoDisponible
	}

	_, err := r.Client.
		Collection(collection).
		Doc(id).
		Set(ctx, data, firestore.MergeAll)

	return err
}

func (r *FirestoreRepository) EliminarDocumento(
	ctx context.Context,
	collection string,
	id string,
) error {

	if r == nil || r.Client == nil {
		return ErrFirestoreNoDisponible
	}

	_, err := r.Client.
		Collection(collection).
		Doc(id).
		Delete(ctx)

	return err
}