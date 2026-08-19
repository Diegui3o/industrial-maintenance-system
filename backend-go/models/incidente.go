package models

import "time"

type Componente struct {
	Nombre   string `json:"nombre" firestore:"nombre"`
	Cantidad int    `json:"cantidad" firestore:"cantidad"`
}

type Incidente struct {
	ID string `json:"id" firestore:"-"`

	IDNumerico int64 `json:"id_numerico" firestore:"id_numerico"`
	SequenceID int64 `json:"sequence_id" firestore:"sequence_id"`

	Fecha time.Time `json:"fecha" firestore:"fecha"`

	Guardia         string `json:"guardia" firestore:"guardia"`
	Sistema         string `json:"sistema" firestore:"sistema"`
	TipoIncidente   string `json:"tipo_de_incidente" firestore:"tipo_de_incidente"`
	AccionRealizada string `json:"accion_realizada" firestore:"accion_realizada"`
	Observaciones   string `json:"observaciones" firestore:"observaciones"`

	Zona       string `json:"zona" firestore:"zona"`
	Nivel      string `json:"nivel" firestore:"nivel"`
	Referencia string `json:"referencia" firestore:"referencia"`

	MetrajeCable string `json:"metraje_cable" firestore:"metraje_cable"`

	Avance int `json:"avance" firestore:"avance"`

	Responsable string `json:"responsable" firestore:"responsable"`
	Reportante  string `json:"reportante" firestore:"reportante"`
	Descripcion string `json:"descripcion" firestore:"descripcion"`
	Prioridad   string `json:"prioridad" firestore:"prioridad"`

	Componentes []Componente `json:"componentes" firestore:"componentes"`
}
