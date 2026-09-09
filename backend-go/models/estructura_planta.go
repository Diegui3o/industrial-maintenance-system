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
type EquipoPlantaDetalle struct {
	Equipo             *Equipo               `json:"equipo"`
	Subproceso         *SubprocesoPlanta     `json:"subproceso,omitempty"`
	Clasificaciones    []ClasificacionPlanta `json:"clasificaciones"`
	Sistemas           []SistemaPlanta       `json:"sistemas"`
	Componentes        []ComponenteEquipo    `json:"componentes"`
}
type ComponenteRepuestoDetalle struct {
	RepuestoID int      `json:"repuesto_id"`
	Codigo     *string  `json:"codigo,omitempty"`
	Nombre     string   `json:"nombre"`
	Cantidad   float64  `json:"cantidad"`
	Posicion   *string  `json:"posicion,omitempty"`
	Notas      *string  `json:"notas,omitempty"`
}