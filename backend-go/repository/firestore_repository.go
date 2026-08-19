package repository

import (
	"context"

	"cloud.google.com/go/firestore"
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
