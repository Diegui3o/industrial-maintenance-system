using System;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Lee valores actuales de atributos PI.
    ///
    /// Este servicio NO descubre elementos ni atributos.
    /// Su única responsabilidad es convertir un AFAttribute
    /// en una lectura de nuestro modelo SensorReading.
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
        /// Lee un atributo PI y genera una lectura de sensor.
        /// </summary>
        public SensorReading? Read(
            AFElement element,
            AFAttribute attribute,
            string piServer,
            string database)
        {
            if (element == null || attribute == null)
            {
                return null;
            }

            try
            {
                var value = attribute.GetValue();

                if (value == null)
                {
                    _logger.LogWarning(
                        "⚠️ Valor nulo: {Element}/{Attribute}",
                        element.Name,
                        attribute.Name);

                    return null;
                }

                if (!value.IsGood)
                {
                    _logger.LogWarning(
                        "⚠️ Calidad no válida: {Element}/{Attribute} | Value={Value} | Timestamp={Timestamp} | Status={Status}",
                        element.Name,
                        attribute.Name,
                        value.Value,
                        value.Timestamp,
                        value.Status);

                    return null;
                }

                double numericValue;

                try
                {
                    numericValue = Convert.ToDouble(value.Value);
                }
                catch
                {
                    _logger.LogWarning(
                        "⚠️ Valor no numérico: {Element}/{Attribute} = {Value}",
                        element.Name,
                        attribute.Name,
                        value.Value);

                    return null;
                }

                var reading = new SensorReading
                {
                    Source = "PI_System",

                    PiServer = piServer,

                    Database = database,

                    RootElement = string.Empty,

                    ElementName = element.Name,

                    ElementPath = element.GetPath(),

                    AttributeName = attribute.Name,

                    Value = numericValue,

                    Unit = attribute.DefaultUOM?.Abbreviation,

                    Timestamp = value.Timestamp,

                    Quality = "Good"
                };

                _logger.LogDebug(
                    "📊 PI {Element}/{Attribute} = {Value}",
                    element.Name,
                    attribute.Name,
                    numericValue);

                return reading;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error leyendo {Element}/{Attribute}",
                    element.Name,
                    attribute.Name);

                return null;
            }
        }
    }
}