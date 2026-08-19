using System;
using Microsoft.Extensions.Logging;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services
{
    public class PiAttributeReaderService
    {
        private readonly ILogger<PiAttributeReaderService> _logger;

        public PiAttributeReaderService(
            ILogger<PiAttributeReaderService> logger)
        {
            _logger = logger;
        }

        public AFValue? Read(AFAttribute attribute)
        {
            if (attribute == null)
            {
                return null;
            }

            try
            {
                var value = attribute.GetValue();

                if (value == null)
                {
                    _logger.LogWarning(
                        "⚠️ Valor nulo para atributo: {Attribute}",
                        attribute.Name);

                    return null;
                }

                if (!value.IsGood)
                {
                    _logger.LogWarning(
                        "⚠️ Calidad no válida para atributo: {Attribute}",
                        attribute.Name);

                    return null;
                }

                _logger.LogDebug(
                    "📊 PI {Attribute} = {Value} @ {Timestamp}",
                    attribute.Name,
                    value.Value,
                    value.Timestamp);

                return value;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error leyendo atributo: {Attribute}",
                    attribute.Name);

                return null;
            }
        }
    }
}