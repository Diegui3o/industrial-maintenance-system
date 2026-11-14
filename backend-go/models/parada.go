package models

import "time"

type Parada struct {
	ID           int    `json:"id"`
	EquipoID     int    `json:"equipo_id"`
	EquipoNombre string `json:"equipo_nombre,omitempty"`
	TagID        *int   `json:"tag_id,omitempty"`
	ComponenteID *int   `json:"componente_id,omitempty"`
	RepuestoID   *int   `json:"repuesto_id,omitempty"`

	// Snapshots informativos
	ProcesoNombre    string `json:"proceso_nombre,omitempty"`
	SubprocesoNombre string `json:"subproceso_nombre,omitempty"`
	ComponenteNombre string `json:"componente_nombre,omitempty"`
	RepuestoNombre   string `json:"repuesto_nombre,omitempty"`
	TagNombre        string `json:"tag_nombre,omitempty"`

	// Tiempos
	Inicio          time.Time `json:"inicio"`
	Fin             time.Time `json:"fin"`
	DuracionMinutos int       `json:"duracion_minutos"`

	// Campos que rellena el operador
	PersonalResponsable string `json:"personal_responsable,omitempty"`
	AreaResponsable     string `json:"area_responsable,omitempty"`
	Motivo              string `json:"motivo,omitempty"`

	// Sincronización con Excel
	SyncExcel          bool       `json:"sync_excel"`
	ExcelRowID         *string    `json:"excel_row_id,omitempty"`
	SyncExcelUpdatedAt *time.Time `json:"sync_excel_updated_at,omitempty"`

	// Auditoría
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

// ParadaSyncLog registra cada ciclo de sincronización con el Excel.
type ParadaSyncLog struct {
	ID                int       `json:"id"`
	EjecutadoEn       time.Time `json:"ejecutado_en"`
	FilasLeidas       int       `json:"filas_leidas"`
	FilasActualizadas int       `json:"filas_actualizadas"`
	Errores           int       `json:"errores"`
	Mensaje           string    `json:"mensaje,omitempty"`
}

// ActualizarResponsableRequest es el body del endpoint
// PUT /api/paradas/{id}/responsable
type ActualizarResponsableRequest struct {
	PersonalResponsable string `json:"personal_responsable"`
	AreaResponsable     string `json:"area_responsable"`
	Motivo              string `json:"motivo"`
}

// ReportarParadaInfo es el contexto que el RuleEngine pasa a
// TiempoActivoService.RegistrarLectura para que sepa si debe
// reportar la parada al cerrar una fila 'inactivo'.
type ReportarParadaInfo struct {
	Reportar            bool
	MinDuracionSegundos int
	EquipoID            int
	ComponenteID        *int
	RepuestoID          *int
}
