using System;
using System.Collections.Generic;

namespace IndustrialConnector.Models
{
    public class SensorReading
    {
        // ============================================
        // IDENTIFICACIÓN DEL ORIGEN
        // ============================================
        public string Source { get; set; } = "PI_System";
        public string PiServer { get; set; } = string.Empty;
        public string Database { get; set; } = string.Empty;

        // ============================================
        // JERARQUÍA COMPLETA (NUEVO)
        // ============================================
        public string RootElement { get; set; } = string.Empty;
        public string ElementName { get; set; } = string.Empty;
        public string ElementPath { get; set; } = string.Empty;
        public string AttributeName { get; set; } = string.Empty;
        
        // ============================================
        // CAMPOS PARA LA JERARQUÍA (NUEVO)
        // ============================================
        public string RutaCompleta { get; set; } = string.Empty;
        public int NivelJerarquico { get; set; } = 0;
        public string ElementoPadre { get; set; } = string.Empty;
        public string PathJerarquico { get; set; } = string.Empty;
        public string ElementosAncestros { get; set; } = string.Empty;

        // ============================================
        // IDENTIFICACIÓN DEL DATO
        // ============================================
        public int EquipmentId { get; set; }
        public string TagName { get; set; } = string.Empty;
        public string PIPointName { get; set; } = string.Empty;
        public string ValueType { get; set; } = string.Empty;

        // ============================================
        // VALOR
        // ============================================
        public double Value { get; set; }
        public string? Unit { get; set; }

        // ============================================
        // CALIDAD Y TIEMPO
        // ============================================
        public string Quality { get; set; } = "Unknown";
        public DateTime Timestamp { get; set; }
    }
}