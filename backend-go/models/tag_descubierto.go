// models/tag_descubierto.go
package models

import "time"

type TagDescubierto struct {
	ID                      int        `json:"id"`
	TagName                 string     `json:"tag_name"`
	TagPath                 string     `json:"tag_path"`
	ElementName             string     `json:"element_name"`
	ElementPath             string     `json:"element_path"`
	PIPointName             string     `json:"pi_point_name"`
	PiServer                string     `json:"pi_server"`
	DatabaseName            string     `json:"database_name"`
	RootElement             string     `json:"root_element"`
	Unidad                  string     `json:"unidad"`
	UltimoValor             float64    `json:"ultimo_valor"`
	UltimaActualizacion     time.Time  `json:"ultima_actualizacion"`
	Frecuencia              int        `json:"frecuencia"`
	Source                  string     `json:"source"`
	EquipmentID             *int       `json:"equipment_id"`
	AsignadoAutomaticamente bool       `json:"asignado_automaticamente"`
	CreadoEn                time.Time  `json:"creado_en"`
	ActualizadoEn           *time.Time `json:"actualizado_en"`

	RutaCompleta       string `json:"ruta_completa"`
	NivelJerarquico    int    `json:"nivel_jerarquico"`
	ElementoPadre      string `json:"elemento_padre"`
	PathJerarquico     string `json:"path_jerarquico"`
	ElementosAncestros string `json:"elementos_ancestros"`
}

// TagAgrupado para sugerencias
type TagAgrupado struct {
	ElementName         string    `json:"elementName"`
	ElementPath         string    `json:"elementPath"`
	TotalTags           int       `json:"totalTags"`
	Tags                []string  `json:"tags"`
	Unidades            []string  `json:"unidades"`
	UltimoValorMax      float64   `json:"ultimoValorMax"`
	UltimaActualizacion time.Time `json:"ultimaActualizacion"`
}
