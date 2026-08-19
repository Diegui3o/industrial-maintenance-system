using System;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Convierte un AFValue recibido desde PI/DataPipe
    /// en nuestro modelo SensorReading.
    ///
    /// Este servicio NO consulta nuevamente PI.
    /// </summary>
    public class PiAttributeReaderService
    {
        private readonly ILogger<PiAttributeReaderService> _logger;

        public PiAttributeReaderService(
            ILogger<PiAttributeReaderService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Convierte un evento de DataPipe en SensorReading.
        /// </summary>
        public SensorReading? Read(
            AFAttribute attribute,
            AFValue value,
            string piServer,
            string database)
        {
            if (attribute == null || value == null)
            {
                return null;
            }

            try
            {
                if (!value.IsGood)
                {
                    _logger.LogWarning(
                        "⚠️ Calidad no válida: {Attribute} | Value={Value} | Timestamp={Timestamp} | Status={Status}",
                        attribute.Name,
                        value.Value,
                        value.Timestamp,
                        value.Status);

                    return null;
                }

                double numericValue;

                try
                {
                    numericValue =
                        Convert.ToDouble(value.Value);
                }
                catch
                {
                    _logger.LogWarning(
                        "⚠️ Valor no numérico: {Attribute} = {Value}",
                        attribute.Name,
                        value.Value);

                    return null;
                }

                var element =
                    attribute.Element;

                var reading = new SensorReading
                {
                    Source = "PI_System",

                    PiServer = piServer,

                    Database = database,

                    RootElement = string.Empty,

                    ElementName =
                        element?.Name ?? string.Empty,

                    ElementPath =
                        element?.GetPath() ?? string.Empty,

                    AttributeName =
                        attribute.Name,

                    Value =
                        numericValue,

                    Unit =
                        attribute.DefaultUOM?.Abbreviation,

                    Timestamp =
                        value.Timestamp,

                    Quality =
                        "Good",

                    PIPointName =
                        GetPIPointName(attribute),

                    ValueType =
                        value.Value?.GetType().Name
                };

                _logger.LogDebug(
                    "📊 PI EVENT {Element}/{Attribute} = {Value}",
                    reading.ElementName,
                    reading.AttributeName,
                    reading.Value);

                return reading;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error convirtiendo evento PI: {Attribute}",
                    attribute.Name);

                return null;
            }
        }

        private string? GetPIPointName(
            AFAttribute attribute)
        {
            try
            {
                return attribute
                    .DataReference?
                    .PIPoint?
                    .Name;
            }
            catch
            {
                return null;
            }
        }
    }
}