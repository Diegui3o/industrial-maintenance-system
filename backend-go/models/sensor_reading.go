// models/sensor_reading.go
package models

type SensorReading struct {
	EquipmentID int     `json:"equipmentId"`
	TagName     string  `json:"tagName"`
	Value       float64 `json:"value"`
	Unit        string  `json:"unit"`
	Quality     string  `json:"quality"`
	Source      string  `json:"source"`
	Timestamp   string  `json:"timestamp"`

	PiServer      string `json:"piServer,omitempty"`
	Database      string `json:"database,omitempty"`
	RootElement   string `json:"rootElement,omitempty"`
	ElementName   string `json:"elementName,omitempty"`
	ElementPath   string `json:"elementPath,omitempty"`
	AttributeName string `json:"attributeName,omitempty"`
	PIPointName   string `json:"piPointName,omitempty"`
	ValueType     string `json:"valueType,omitempty"`

	RutaCompleta       string `json:"rutaCompleta,omitempty"`
	NivelJerarquico    int    `json:"nivelJerarquico,omitempty"`
	ElementoPadre      string `json:"elementoPadre,omitempty"`
	PathJerarquico     string `json:"pathJerarquico,omitempty"`
	ElementosAncestros string `json:"elementosAncestros,omitempty"`
}
