// models/pi_tag.go
package models

import "time"

// PITagDiscovery - Tag descubierto de PI System
type PITagDiscovery struct {
    Parametro  string  `json:"parametro"`
    Unidad     string  `json:"unidad"`
    Frecuencia int     `json:"frecuencia"`
    UltimoValor float64 `json:"ultimo_valor"`
    UltimaActualizacion time.Time `json:"ultima_actualizacion"`
}

// PITagSugerencia - Sugerencia de agrupación automática
type PITagSugerencia struct {
    Prefijo   string   `json:"prefijo"`
    Cantidad  int      `json:"cantidad"`
    Tags      []string `json:"tags"`
    Unidades  []string `json:"unidades"`
    EquipoSugerido string `json:"equipo_sugerido"`
}

// PITagAsignacion - Asignación de tags a equipo
type PITagAsignacion struct {
    EquipoID int      `json:"equipo_id"`
    Tags     []string `json:"tags"`
    CrearEquipo bool   `json:"crear_equipo"`
    NombreEquipo string `json:"nombre_equipo,omitempty"`
}

// PITagEquipo - Tags asignados a un equipo
type PITagEquipo struct {
    EquipoID   int      `json:"equipo_id"`
    EquipoNombre string `json:"equipo_nombre"`
    Tags       []string `json:"tags"`
    TotalTags  int      `json:"total_tags"`
}