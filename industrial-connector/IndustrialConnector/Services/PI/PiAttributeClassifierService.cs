using System;
using System.Collections.Generic;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Clasifica atributos PI según su importancia
    /// para el sistema de mantenimiento.
    ///
    /// Este servicio NO lee valores.
    /// Solo determina qué atributos deben monitorearse.
    /// </summary>
    public class PiAttributeClassifierService
    {
        /// <summary>
        /// Clasifica un atributo individual.
        /// </summary>
        public PiAttributePriority Classify(
            PiAttributeInfo attribute)
        {
            if (attribute == null)
            {
                return PiAttributePriority.Ignore;
            }

            var name = attribute.AttributeName
                .Trim()
                .ToLowerInvariant();

            // ============================================
            // 1. VARIABLES CRÍTICAS
            // ============================================

            if (ContainsAny(
                name,
                "alarm",
                "trip",
                "fault",
                "failure",
                "emergency",
                "status",
                "estado"))
            {
                return PiAttributePriority.Critical;
            }

            // ============================================
            // 2. VARIABLES ELÉCTRICAS IMPORTANTES
            // ============================================

            if (ContainsAny(
                name,
                "current",
                "corriente",
                "volt",
                "voltage",
                "freq",
                "frequency",
                "power",
                "kw",
                "kva",
                "kvar",
                "mw",
                "mva",
                "pf"))
            {
                return PiAttributePriority.Important;
            }

            // ============================================
            // 3. VARIABLES FÍSICAS IMPORTANTES
            // ============================================

            if (ContainsAny(
                name,
                "temperature",
                "temperatura",
                "pressure",
                "presion",
                "vibration",
                "vibracion",
                "speed",
                "velocidad",
                "flow",
                "flujo"))
            {
                return PiAttributePriority.Important;
            }

            // ============================================
            // 4. VARIABLES DE MEDICIÓN
            // ============================================

            if (ContainsAny(
                name,
                "value",
                "mean",
                "avg",
                "average",
                "cal"))
            {
                return PiAttributePriority.Normal;
            }

            // ============================================
            // 5. TODO LO DEMÁS
            // ============================================

            return PiAttributePriority.Ignore;
        }

        /// <summary>
        /// Clasifica una colección completa de atributos.
        /// </summary>
        public Dictionary<PiAttributePriority, List<PiAttributeInfo>>
            ClassifyAll(IEnumerable<PiAttributeInfo> attributes)
        {
            var result =
                new Dictionary<PiAttributePriority, List<PiAttributeInfo>>();

            foreach (PiAttributePriority priority
                in Enum.GetValues(typeof(PiAttributePriority)))
            {
                result[priority] =
                    new List<PiAttributeInfo>();
            }

            foreach (var attribute in attributes)
            {
                var priority = Classify(attribute);

                result[priority].Add(attribute);
            }

            return result;
        }

        private bool ContainsAny(
            string value,
            params string[] patterns)
        {
            foreach (var pattern in patterns)
            {
                if (value.Contains(pattern))
                {
                    return true;
                }
            }

            return false;
        }
    }
}