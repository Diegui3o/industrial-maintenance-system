using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Descubre automáticamente los atributos existentes
    /// dentro de los elementos del PI System.
    ///
    /// Responsabilidad:
    /// - Recibir elementos descubiertos.
    /// - Obtener sus atributos.
    /// - Convertirlos a PiAttributeInfo.
    ///
    /// No lee valores y no comunica con el backend.
    /// </summary>
    public class PiAttributeDiscoveryService
    {
        private readonly ILogger<PiAttributeDiscoveryService> _logger;

        public PiAttributeDiscoveryService(
            ILogger<PiAttributeDiscoveryService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Descubre todos los atributos de una lista de elementos.
        /// </summary>
        public List<PiAttributeInfo> DiscoverAttributes(
            IEnumerable<AFElement> elements,
            string piServer,
            string database)
        {
            var attributes = new List<PiAttributeInfo>();

            foreach (var element in elements)
            {
                try
                {
                    foreach (AFAttribute attribute in element.Attributes)
                    {
                        var info = CreateAttributeInfo(
                            element,
                            attribute,
                            piServer,
                            database);

                        attributes.Add(info);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "⚠️ Error descubriendo atributos del elemento {Element}",
                        element.Name);
                }
            }

            _logger.LogInformation(
                "🔎 Atributos descubiertos: {Count}",
                attributes.Count);

            return attributes;
        }

        /// <summary>
        /// Convierte un AFAttribute en nuestro modelo interno.
        /// </summary>
        private PiAttributeInfo CreateAttributeInfo(
            AFElement element,
            AFAttribute attribute,
            string piServer,
            string database)
        {
            return new PiAttributeInfo
            {
                PiServer = piServer,
                Database = database,

                ElementName = element.Name,

                ElementPath = element.GetPath(),

                AttributeName = attribute.Name,

                FullPath =
                    $"{element.GetPath()}/{attribute.Name}",

                Unit = GetUnit(attribute),

                DataType = attribute.Type.ToString(),

                IsDataReference =
                    attribute.DataReference != null,

                DiscoveredAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Obtiene la unidad configurada en el atributo.
        /// </summary>
        private string? GetUnit(AFAttribute attribute)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(
                    attribute.ConfigString))
                {
                    return attribute.DefaultUOM?.Abbreviation;
                }
            }
            catch
            {
                // Algunas configuraciones de AF pueden
                // no tener una UOM disponible.
            }

            return null;
        }
    }
}