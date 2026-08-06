package models

import "time"

type Equipo struct {
    ID               int        `json:"id"`
    Codigo           string     `json:"codigo"`
    Nombre           string     `json:"nombre"`
    Area             string     `json:"area"`
    Tipo             string     `json:"tipo"`
    Fase             string     `json:"fase"`
    Fabricante       string     `json:"fabricante"`
    Modelo           string     `json:"modelo"`
    NumeroSerie      string     `json:"numero_serie"`
    Critico          bool       `json:"critico"`
    
    // ========== NUEVOS CAMPOS ==========
    ActivoPadreID    *int       `json:"activo_padre_id"`    
    NivelJerarquia   int        `json:"nivel_jerarquia"`    
    Tag              string     `json:"tag"`                
    CodigoSAP        string     `json:"codigo_sap"`         
    TipoActivo       string     `json:"tipo_activo"`        
    UbicacionFisica  string     `json:"ubicacion_fisica"`   
    Marca            string     `json:"marca"`
    ModeloEquipo     string     `json:"modelo_equipo"`
    DescripcionLarga string     `json:"descripcion_larga"`
    IP               string     `json:"ip"`           
    // ====================================
    
    EstadoEquipo     string     `json:"estado_equipo"`
    FechaInstalacion *time.Time `json:"fecha_instalacion"`
    FechaCreacion    time.Time  `json:"fecha_creacion"`
    ActualizadoEn    *time.Time `json:"actualizado_en"`
}