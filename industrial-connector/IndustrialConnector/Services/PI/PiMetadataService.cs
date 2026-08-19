using System;
using Microsoft.Extensions.Logging;
using OSIsoft.AF.Asset;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Obtiene metadata de elementos y atributos PI.
    ///
    /// No lee valores históricos ni actuales.
    /// No envía información al backend.
    /// </summary>
    public class PiMetadataService
    {
        private readonly ILogger<PiMetadataService> _logger;

        public PiMetadataService(
            ILogger<PiMetadataService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Convierte un atributo AF en nuestro modelo de metadata.
        /// </summary>
        public PiDiscoveredAttribute GetAttributeMetadata(
            AFAttribute attribute)
        {
            if (attribute == null)
            {
                throw new ArgumentNullException(nameof(attribute));
            }

            var result = new PiDiscoveredAttribute
            {
                Name = attribute.Name,
                Path = attribute.GetPath(),
                DataType = GetDataType(attribute),
                Unit = GetUnit(attribute),
                Description = GetDescription(attribute)
            };

            _logger.LogDebug(
                "📋 Metadata PI: {Path} | Tipo={DataType} | Unidad={Unit}",
                result.Path,
                result.DataType,
                result.Unit ?? "N/A");

            return result;
        }

        private string GetDataType(
            AFAttribute attribute)
        {
            try
            {
                return attribute.Type.ToString();
            }
            catch
            {
                return "Unknown";
            }
        }

        private string? GetUnit(
            AFAttribute attribute)
        {
            try
            {
                return attribute.DefaultUOM?.Name;
            }
            catch
            {
                return null;
            }
        }

        private string? GetDescription(
            AFAttribute attribute)
        {
            try
            {
                return attribute.Description;
            }
            catch
            {
                return null;
            }
        }
    }
}