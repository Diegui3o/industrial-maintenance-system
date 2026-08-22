package models

import "time"

type TagDescubierto struct {
	ID                      int        `json:"id"`
	TagName                 string     `json:"tag_name"`
	TagPath                 string     `json:"tag_path"`
	ElementName             string     `json:"element_name"`
	ElementPath             string     `json:"element_path"`
	PIPointName             string     `json:"pi_point_name"`
	Unidad                  string     `json:"unidad"`
	UltimoValor             float64    `json:"ultimo_valor"`
	UltimaActualizacion     time.Time  `json:"ultima_actualizacion"`
	Frecuencia              int        `json:"frecuencia"`
	Source                  string     `json:"source"`
	EquipmentID             *int       `json:"equipment_id"`
	AsignadoAutomaticamente bool       `json:"asignado_automaticamente"`
	CreadoEn                time.Time  `json:"creado_en"`
	ActualizadoEn           *time.Time `json:"actualizado_en"`
}
