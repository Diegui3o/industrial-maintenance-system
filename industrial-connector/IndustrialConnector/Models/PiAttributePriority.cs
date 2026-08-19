namespace IndustrialConnector.Models
{
    /// <summary>
    /// Nivel de importancia de un atributo PI.
    /// </summary>
    public enum PiAttributePriority
    {
        /// <summary>
        /// No debe procesarse automáticamente.
        /// </summary>
        Ignore = 0,

        /// <summary>
        /// Variable normal de monitoreo.
        /// </summary>
        Normal = 1,

        /// <summary>
        /// Variable relevante para mantenimiento.
        /// </summary>
        Important = 2,

        /// <summary>
        /// Variable que puede tener impacto
        /// directo en una condición de alarma.
        /// </summary>
        Critical = 3
    }
}