package models

import "time"

type MaestroMotorElectrico struct {
	ComponenteID int `json:"componente_id"`

	// Identificación del componente
	CodigoInterno      *string    `json:"codigo_interno,omitempty"`
	CodigoSAP          *string    `json:"codigo_sap,omitempty"`
	TipoComponente     *string    `json:"tipo_componente,omitempty"`
	NombreComponente   *string    `json:"nombre_componente,omitempty"`
	Tag                *string    `json:"tag,omitempty"`
	PlacaMotor         *string    `json:"placa_motor,omitempty"`
	FechaActualizacion *time.Time `json:"fecha_actualizacion,omitempty"`

	// Ubicación / datos generales
	Zona        *string `json:"zona,omitempty"`
	Marca       *string `json:"marca,omitempty"`
	Modelo      *string `json:"modelo,omitempty"`
	NumeroSerie *string `json:"numero_serie,omitempty"`

	// Datos técnicos
	KW   *float64 `json:"kw,omitempty"`
	HP   *float64 `json:"hp,omitempty"`
	Volt *string  `json:"volt,omitempty"`
	Amp  *string  `json:"amp,omitempty"`
	RPM  *float64 `json:"rpm,omitempty"`

	Frame *string  `json:"frame,omitempty"`
	FS    *float64 `json:"fs,omitempty"`
	FP    *float64 `json:"fp,omitempty"`
	Clase *string  `json:"clase,omitempty"`
	Duty  *string  `json:"duty,omitempty"`
	Eff   *float64 `json:"eff,omitempty"`

	// Arranque
	TipoArranque *string `json:"tipo_arranque,omitempty"`

	// Rodamientos
	RodamientoDE  *string `json:"rodamiento_de,omitempty"`
	RodamientoNDE *string `json:"rodamiento_nde,omitempty"`
}