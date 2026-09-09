package models

type ProcesoPlanta struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
}

type SubprocesoPlanta struct {
	ID          int     `json:"id"`
	ProcesoID   int     `json:"proceso_id"`
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
	ID          int     `json:"id"`
	EquipoID    int     `json:"equipo_id"`
	Codigo      *string `json:"codigo,omitempty"`
	Nombre      string  `json:"nombre"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activo      bool    `json:"activo"`
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

    Proceso *ProcesoPlanta `json:"proceso,omitempty"`
    Subproceso *SubprocesoPlanta `json:"subproceso,omitempty"`

    Sistema *SistemaPlanta `json:"sistema,omitempty"`
    SubprocesoSistema *SubprocesoSistemaPlanta `json:"subproceso_sistema,omitempty"`

    Clasificaciones []ClasificacionPlanta `json:"clasificaciones"`
    Sistemas []SistemaPlanta `json:"sistemas"`
    Componentes []ComponenteEquipo `json:"componentes"`
}