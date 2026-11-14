package models

type TagParaMonitorear struct {
	UmbralID                  int    `json:"umbral_id"`
	EquipoID                  int    `json:"equipo_id"`
	EquipoNombre              string `json:"equipo_nombre"`
	TagID                     int    `json:"tag_id"`
	Parametro                 string `json:"parametro"`
	ElementPath               string `json:"element_path"`
	ElementName               string `json:"element_name"`
	AttributeName             string `json:"attribute_name"`
	TagName                   string `json:"tag_name"`
	Unidad                    string `json:"unidad"`
	Modo                      string `json:"modo"`
	ContarTiempoActivo        bool   `json:"contar_tiempo_activo"`
	ReportarParada            bool   `json:"reportar_parada"`
	MinDuracionParadaSegundos int    `json:"min_duracion_parada_segundos"`
}
