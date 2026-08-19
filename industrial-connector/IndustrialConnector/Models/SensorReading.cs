using System;

namespace IndustrialConnector.Models
{
    public class SensorReading
    {
        // Identificación del origen
        public string Source { get; set; } = "PI_System";

        public string PiServer { get; set; } = string.Empty;

        public string Database { get; set; } = string.Empty;

        // Jerarquía AF
        public string RootElement { get; set; } = string.Empty;

        public string ElementName { get; set; } = string.Empty;

        public string ElementPath { get; set; } = string.Empty;

        // Identificación del dato
        public int EquipmentId { get; set; }

        public string TagName { get; set; } = string.Empty;

        public string AttributeName { get; set; } = string.Empty;

        // Valor
        public double Value { get; set; }

        public string? Unit { get; set; }

        // Calidad y tiempo
        public string Quality { get; set; } = "Unknown";

        public DateTime Timestamp { get; set; }

        // Información adicional para escalar posteriormente
        public string? PIPointName { get; set; }

        public string? ValueType { get; set; }
    }
}