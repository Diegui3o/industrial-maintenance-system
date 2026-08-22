package models

type FuenteDisponible struct {
	PiServer     string `json:"pi_server"`
	DatabaseName string `json:"database_name"`
	TotalTags    int64  `json:"total_tags"`
}
