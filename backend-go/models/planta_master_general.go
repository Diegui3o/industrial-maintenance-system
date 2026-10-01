package models

type MaestroGeneralItem struct {
	Fase string `json:"fase"`

	ProcesoID *int `json:"proceso_id"`
	Proceso   string `json:"proceso"`

	SubprocesoID *int `json:"subproceso_id"`
	Subproceso   string `json:"subproceso"`

	EquipoID     *int   `json:"equipo_id"`
	EquipoCodigo string `json:"equipo_codigo"`
	EquipoNombre string `json:"equipo_nombre"`

	ComponenteID     *int  `json:"componente_id"`
	ComponenteCodigo *string `json:"componente_codigo"`
	ComponenteTag    *string `json:"componente_tag"`
	ComponenteNombre *string `json:"componente_nombre"`

	RepuestoID     *int    `json:"repuesto_id"`
	RepuestoNombre *string `json:"repuesto_nombre"`
}