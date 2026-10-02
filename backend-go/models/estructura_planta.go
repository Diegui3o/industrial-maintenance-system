package models

import "time"

type ProcesoPlanta struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type SubprocesoPlanta struct {
	ID          int     `json:"id"`
	ProcesoID   *int    `json:"proceso_id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type PlantaEquipo struct {
	EquipoID     int `json:"equipo_id"`
	SubprocesoID int `json:"subproceso_id"`
}

type ClasificacionPlanta struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type SistemaPlanta struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type ComponenteEquipo struct {
	ID                  int                      `json:"id"`
	EquipoID            *int                     `json:"equipo_id"`
	Codigo              *string                  `json:"codigo,omitempty"`
	CodigoSAP           *string                  `json:"codigo_sap,omitempty"`
	Tag                 *string                  `json:"tag,omitempty"`
	Nombre              string                   `json:"nombre"`
	TipoComponente      *string                  `json:"tipo_componente,omitempty"`
	Marca               *string                  `json:"marca,omitempty"`
	Modelo              *string                  `json:"modelo,omitempty"`
	NumeroSerie         *string                  `json:"numero_serie,omitempty"`
	Descripcion         *string                  `json:"descripcion,omitempty"`
	Activo              bool                     `json:"activo"`
	CreadoEn            *time.Time               `json:"creado_en,omitempty"`
	FechaCreacion       *time.Time               `json:"fecha_creacion,omitempty"`
	FechaActualizacion  *time.Time               `json:"fecha_actualizacion,omitempty"`
	MotorElectrico      *ComponenteMotorElectrico `json:"motor_electrico,omitempty"`
}

type ComponenteMotorElectrico struct {
	ComponenteID          int      `json:"componente_id"`
	PlacaMotor            *string  `json:"placa_motor,omitempty"`
	Fabricante            *string  `json:"fabricante,omitempty"`
	CodigoFabricante      *string  `json:"codigo_fabricante,omitempty"`
	Producto              *string  `json:"producto,omitempty"`

	RatedVoltage          *string  `json:"rated_voltage,omitempty"`
	RatedCurrent          *string  `json:"rated_current,omitempty"`
	Frequency             *float64 `json:"frequency,omitempty"`
	Phases                *int     `json:"phases,omitempty"`
	PowerFactor           *float64 `json:"power_factor,omitempty"`
	Efficiency            *float64 `json:"efficiency,omitempty"`
	ServiceFactor         *float64 `json:"service_factor,omitempty"`

	Output     *float64 `json:"output,omitempty"`
	Horsepower *float64 `json:"horsepower,omitempty"`
	RatedSpeed *float64 `json:"rated_speed,omitempty"`
	NumberOfPoles         *int     `json:"number_of_poles,omitempty"`

	Design                *string  `json:"design,omitempty"`
	Enclosure             *string  `json:"enclosure,omitempty"`
	DegreeOfProtection    *string  `json:"degree_of_protection,omitempty"`
	Frame                 *string  `json:"frame,omitempty"`
	Mounting              *string  `json:"mounting,omitempty"`
	InsulationClass       *string  `json:"insulation_class,omitempty"`
	DutyCycle             *string  `json:"duty_cycle,omitempty"`

	Slip                  *float64 `json:"slip,omitempty"`
	RatedTorque           *float64 `json:"rated_torque,omitempty"`
	LockedRotorTorque     *float64 `json:"locked_rotor_torque,omitempty"`
	BreakdownTorque       *float64 `json:"breakdown_torque,omitempty"`

	StartingMethod        *string  `json:"starting_method,omitempty"`
	LRAmpers              *string  `json:"l_r_amperes,omitempty"`
	LRC                   *string  `json:"lrc,omitempty"`
	NoLoadCurrent         *string  `json:"no_load_current,omitempty"`
	LockedRotorTime       *string  `json:"locked_rotor_time,omitempty"`
	Rotation              *string  `json:"rotation,omitempty"`

	MomentOfInertia       *float64 `json:"moment_of_inertia,omitempty"`
	TemperatureRise       *float64 `json:"temperature_rise,omitempty"`
	AmbientTemperature    *string  `json:"ambient_temperature,omitempty"`
	Altitude              *float64 `json:"altitude,omitempty"`
	NoiseLevel            *float64 `json:"noise_level,omitempty"`
	ApproximateWeight     *float64 `json:"approximate_weight,omitempty"`

	BearingDriveEnd       *string  `json:"bearing_drive_end,omitempty"`
	BearingNonDriveEnd    *string  `json:"bearing_non_drive_end,omitempty"`
	FrontBearing          *string  `json:"front_bearing,omitempty"`
	RearBearing           *string  `json:"rear_bearing,omitempty"`

	Connection            *string  `json:"connection,omitempty"`
	Standard              *string  `json:"standard,omitempty"`
	NemaClassification    *string  `json:"nema_classification,omitempty"`
	YearOfManufacture     *int     `json:"year_of_manufacture,omitempty"`

	CreadoEn              *time.Time `json:"creado_en,omitempty"`
	ActualizadoEn         *time.Time `json:"actualizado_en,omitempty"`
}

type Repuesto struct {
	ID          int     `json:"id"`
	Codigo      *string `json:"codigo,omitempty"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}
type ComponenteRepuestoDetalle struct {
	RepuestoID int     `json:"repuesto_id"`
	Codigo     *string `json:"codigo,omitempty"`
	Nombre     string  `json:"nombre"`
	Cantidad   float64 `json:"cantidad"`
	Posicion   *string `json:"posicion,omitempty"`
	Notas      *string `json:"notas,omitempty"`
}
type SubprocesoSistemaPlanta struct {
	ID          int     `json:"id"`
	SistemaID   int     `json:"sistema_id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type SistemaPlantaEquipo struct {
	EquipoID            int `json:"equipo_id"`
	SubprocesoSistemaID int `json:"subproceso_sistema_id"`
}

type SubcomponenteEquipo struct {
	ID           int     `json:"id"`
	ComponenteID int     `json:"componente_id"`
	Codigo       *string `json:"codigo,omitempty"`
	Nombre       string  `json:"nombre"`
	Descripcion  *string `json:"descripcion,omitempty"`
	Activo       bool    `json:"activo"`
}

type SubcomponenteRepuestoDetalle struct {
	RepuestoID int     `json:"repuesto_id"`
	Codigo     *string `json:"codigo,omitempty"`
	Nombre     string  `json:"nombre"`
	Cantidad   float64 `json:"cantidad"`
	Posicion   *string `json:"posicion,omitempty"`
	Notas      *string `json:"notas,omitempty"`
}
type SistemaPlantaEquipoDetalle struct {
	EquipoID            int    `json:"equipo_id"`
	SubprocesoSistemaID int    `json:"subproceso_sistema_id"`
	Codigo              string `json:"codigo"`
	Nombre              string `json:"nombre"`
	Area                string `json:"area"`
	Tipo                string `json:"tipo"`
	EstadoEquipo        string `json:"estado_equipo"`
}
type EquipoPlantaDetalle struct {
	Equipo *Equipo `json:"equipo"`

	Proceso    *ProcesoPlanta    `json:"proceso,omitempty"`
	Subproceso *SubprocesoPlanta `json:"subproceso,omitempty"`

	Sistema           *SistemaPlanta           `json:"sistema,omitempty"`
	SubprocesoSistema *SubprocesoSistemaPlanta `json:"subproceso_sistema,omitempty"`

	Clasificaciones []ClasificacionPlanta `json:"clasificaciones"`
	Sistemas        []SistemaPlanta       `json:"sistemas"`
	Componentes     []ComponenteEquipo    `json:"componentes"`
}
type RelacionComponente struct {
	ComponenteID int
	EquipoID     *int
}
