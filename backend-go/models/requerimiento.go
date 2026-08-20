package models

import "time"

type Requerimiento struct {
	ID string `json:"id" firestore:"-"`

	IDNumerico int64 `json:"id_numerico" firestore:"id_numerico"`
	SequenceID int64 `json:"sequence_id" firestore:"sequence_id"`

	Fecha time.Time `json:"fecha" firestore:"fecha"`

	Area                     string `json:"area" firestore:"area"`
	TipoRequerimiento        string `json:"tipo_de_requerimiento" firestore:"tipo_de_requerimiento"`
	Solicitante              string `json:"solicitante" firestore:"solicitante"`
	DescripcionRequerimiento string `json:"descripcion_del_requerimiento" firestore:"descripcion_del_requerimiento"`
	AccionRealizada          string `json:"accion_realizada" firestore:"accion_realizada"`

	Zona          string `json:"zona" firestore:"zona"`
	Nivel         string `json:"nivel" firestore:"nivel"`
	Referencia    string `json:"referencia" firestore:"referencia"`
	Observaciones string `json:"observaciones" firestore:"observaciones"`

	Componentes []Componente `json:"componentes" firestore:"componentes"`

	Avance int `json:"avance" firestore:"avance"`

	Prioridad  string `json:"prioridad" firestore:"prioridad"`
	Completado bool   `json:"completado" firestore:"completado"`
}
