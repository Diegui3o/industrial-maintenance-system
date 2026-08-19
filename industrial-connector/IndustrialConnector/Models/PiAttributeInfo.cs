using System;

namespace IndustrialConnector.Models
{
    /// <summary>
    /// Representa un atributo descubierto automáticamente
    /// dentro de un elemento de PI System.
    ///
    /// Este modelo NO contiene todavía el valor leído.
    /// Describe qué es el atributo y dónde se encuentra.
    /// </summary>
    public class PiAttributeInfo
    {
        /// <summary>
        /// Nombre del servidor PI.
        /// </summary>
        public string PiServer { get; set; } = string.Empty;

        /// <summary>
        /// Nombre de la base de datos AF.
        /// </summary>
        public string Database { get; set; } = string.Empty;

        /// <summary>
        /// Nombre del elemento.
        /// Ejemplo: SE138_Trafo_01
        /// </summary>
        public string ElementName { get; set; } = string.Empty;

        /// <summary>
        /// Ruta completa del elemento dentro de AF.
        /// </summary>
        public string ElementPath { get; set; } = string.Empty;

        /// <summary>
        /// Nombre del atributo.
        /// Ejemplo: I a_cal
        /// </summary>
        public string AttributeName { get; set; } = string.Empty;

        /// <summary>
        /// Ruta lógica completa:
        /// Elemento/Atributo
        /// </summary>
        public string FullPath { get; set; } = string.Empty;

        /// <summary>
        /// Unidad de ingeniería configurada en PI.
        /// </summary>
        public string? Unit { get; set; }

        /// <summary>
        /// Tipo de dato del atributo.
        /// </summary>
        public string DataType { get; set; } = string.Empty;

        /// <summary>
        /// Indica si el atributo está configurado
        /// como fuente de datos histórica/PI Point.
        /// </summary>
        public bool IsDataReference { get; set; }

        /// <summary>
        /// Fecha en que fue descubierto por el conector.
        /// </summary>
        public DateTime DiscoveredAt { get; set; }
    }
}