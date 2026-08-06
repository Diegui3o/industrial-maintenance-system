// models/sensor_reading.go
package models

type SensorReading struct {
	EquipmentID int     `json:"equipment_id"`
	TagName     string  `json:"tag_name"`
	Value       float64 `json:"value"`
	Unit        string  `json:"unit"`
	Quality     string  `json:"quality"`
	Source      string  `json:"source"`
	Timestamp   string  `json:"timestamp"`
}
