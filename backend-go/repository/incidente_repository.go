package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"backend/models"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

var ErrIncidenteNoEncontrado = errors.New("incidente no encontrado")

type IncidenteRepository interface {
	List(ctx context.Context, limit int) ([]models.Incidente, error)
	Get(ctx context.Context, id string) (*models.Incidente, error)
	Create(ctx context.Context, incidente *models.Incidente) (string, error)
	Update(ctx context.Context, id string, incidente *models.Incidente) error
	Delete(ctx context.Context, id string) error
}

type FirestoreIncidenteRepository struct {
	client     *firestore.Client
	collection string
}

func NewFirestoreIncidenteRepository(client *firestore.Client) *FirestoreIncidenteRepository {
	return &FirestoreIncidenteRepository{
		client:     client,
		collection: "incidentes",
	}
}

func (r *FirestoreIncidenteRepository) collectionRef() *firestore.CollectionRef {
	return r.client.Collection(r.collection)
}

func (r *FirestoreIncidenteRepository) List(
	ctx context.Context,
	limit int,
) ([]models.Incidente, error) {

	if limit <= 0 {
		limit = 200
	}

	if limit > 500 {
		limit = 500
	}

	query := r.collectionRef().
		OrderBy("sequence_id", firestore.Desc).
		Limit(limit)

	iter := query.Documents(ctx)
	defer iter.Stop()

	resultado := make([]models.Incidente, 0)

	for {
		doc, err := iter.Next()

		if err == iterator.Done {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("error consultando incidentes: %w", err)
		}

		incidente, err := incidenteFromDocument(doc)

		if err != nil {
			return nil, err
		}

		resultado = append(resultado, *incidente)
	}

	return resultado, nil
}

func (r *FirestoreIncidenteRepository) Get(
	ctx context.Context,
	id string,
) (*models.Incidente, error) {

	doc, err := r.collectionRef().Doc(id).Get(ctx)

	if err != nil {
		if err == iterator.Done {
			return nil, ErrIncidenteNoEncontrado
		}

		return nil, fmt.Errorf("error obteniendo incidente %s: %w", id, err)
	}

	if !doc.Exists() {
		return nil, ErrIncidenteNoEncontrado
	}

	return incidenteFromDocument(doc)
}

func (r *FirestoreIncidenteRepository) Create(
	ctx context.Context,
	incidente *models.Incidente,
) (string, error) {

	if incidente == nil {
		return "", errors.New("incidente nulo")
	}

	if incidente.Fecha.IsZero() {
		incidente.Fecha = time.Now()
	}

	data := incidenteToFirestore(incidente)

	docRef := r.collectionRef().NewDoc()

	_, err := docRef.Set(ctx, data)

	if err != nil {
		return "", fmt.Errorf("error creando incidente: %w", err)
	}

	return docRef.ID, nil
}

func (r *FirestoreIncidenteRepository) Update(
	ctx context.Context,
	id string,
	incidente *models.Incidente,
) error {

	if incidente == nil {
		return errors.New("incidente nulo")
	}

	docRef := r.collectionRef().Doc(id)

	snap, err := docRef.Get(ctx)

	if err != nil {
		return fmt.Errorf("error verificando incidente: %w", err)
	}

	if !snap.Exists() {
		return ErrIncidenteNoEncontrado
	}

	data := incidenteToFirestore(incidente)

	// No modificamos el ID de Firestore.
	delete(data, "id")

	_, err = docRef.Set(ctx, data, firestore.MergeAll)

	if err != nil {
		return fmt.Errorf("error actualizando incidente %s: %w", id, err)
	}

	return nil
}

func (r *FirestoreIncidenteRepository) Delete(
	ctx context.Context,
	id string,
) error {

	docRef := r.collectionRef().Doc(id)

	snap, err := docRef.Get(ctx)

	if err != nil {
		return fmt.Errorf("error verificando incidente: %w", err)
	}

	if !snap.Exists() {
		return ErrIncidenteNoEncontrado
	}

	_, err = docRef.Delete(ctx)

	if err != nil {
		return fmt.Errorf("error eliminando incidente %s: %w", id, err)
	}

	return nil
}

func incidenteFromDocument(
	doc *firestore.DocumentSnapshot,
) (*models.Incidente, error) {

	data := doc.Data()

	incidente := &models.Incidente{
		ID:              doc.Ref.ID,
		IDNumerico:      parseInt64(data["id_numerico"]),
		SequenceID:      parseInt64(data["sequence_id"]),
		Fecha:           parseTime(data["fecha"]),
		Guardia:         parseString(data["guardia"]),
		Sistema:         parseString(data["sistema"]),
		TipoIncidente:   parseString(data["tipo_de_incidente"]),
		AccionRealizada: parseString(data["accion_realizada"]),
		Observaciones:   parseString(data["observaciones"]),
		Zona:            parseString(data["zona"]),
		Nivel:           parseString(data["nivel"]),
		Referencia:      parseString(data["referencia"]),
		MetrajeCable:    parseString(data["metraje_cable"]),
		Avance:          parseInt(data["avance"]),
		Responsable:     parseString(data["responsable"]),
		Reportante:      parseString(data["reportante"]),
		Descripcion:     parseString(data["descripcion"]),
		Prioridad:       parseString(data["prioridad"]),
	}

	if incidente.Fecha.IsZero() {
		incidente.Fecha = time.Now()
	}

	if raw, ok := data["componentes"].([]interface{}); ok {
		for _, item := range raw {
			if mapa, ok := item.(map[string]interface{}); ok {
				incidente.Componentes = append(
					incidente.Componentes,
					models.Componente{
						Nombre:   parseString(mapa["nombre"]),
						Cantidad: parseInt(mapa["cantidad"]),
					},
				)
			}
		}
	}

	return incidente, nil
}

func incidenteToFirestore(
	incidente *models.Incidente,
) map[string]interface{} {

	componentes := make([]map[string]interface{}, 0, len(incidente.Componentes))

	for _, componente := range incidente.Componentes {
		componentes = append(componentes, map[string]interface{}{
			"nombre":   componente.Nombre,
			"cantidad": componente.Cantidad,
		})
	}

	return map[string]interface{}{
		"id_numerico":       incidente.IDNumerico,
		"sequence_id":       incidente.SequenceID,
		"fecha":             incidente.Fecha,
		"guardia":           incidente.Guardia,
		"sistema":           incidente.Sistema,
		"tipo_de_incidente": incidente.TipoIncidente,
		"accion_realizada":  incidente.AccionRealizada,
		"observaciones":     incidente.Observaciones,
		"zona":              incidente.Zona,
		"nivel":             incidente.Nivel,
		"referencia":        incidente.Referencia,
		"metraje_cable":     incidente.MetrajeCable,
		"avance":            incidente.Avance,
		"responsable":       incidente.Responsable,
		"reportante":        incidente.Reportante,
		"descripcion":       incidente.Descripcion,
		"prioridad":         incidente.Prioridad,
		"componentes":       componentes,
	}
}

func parseString(value interface{}) string {
	if value == nil {
		return ""
	}

	return fmt.Sprint(value)
}

func parseInt(value interface{}) int {
	switch v := value.(type) {
	case int:
		return v
	case int32:
		return int(v)
	case int64:
		return int(v)
	case float64:
		return int(v)
	case float32:
		return int(v)
	case string:
		var result int
		_, _ = fmt.Sscanf(v, "%d", &result)
		return result
	default:
		return 0
	}
}

func parseInt64(value interface{}) int64 {
	switch v := value.(type) {
	case int:
		return int64(v)
	case int32:
		return int64(v)
	case int64:
		return v
	case float64:
		return int64(v)
	case float32:
		return int64(v)
	case string:
		var result int64
		_, _ = fmt.Sscanf(v, "%d", &result)
		return result
	default:
		return 0
	}
}

func parseTime(value interface{}) time.Time {
	switch v := value.(type) {
	case time.Time:
		return v
	case *time.Time:
		if v != nil {
			return *v
		}
	}

	return time.Time{}
}
