using System;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services.PI
{
    public class PiAttributeReaderService
    {
        private readonly ILogger<PiAttributeReaderService> _logger;

        public PiAttributeReaderService(ILogger<PiAttributeReaderService> logger)
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
        _logger.LogInformation("🔍🔍🔍 PiAttributeReaderService.Read() LLAMADO 🔍🔍🔍");

        if (attribute == null)
        {
            _logger.LogWarning("⚠️⚠️⚠️ Atributo es NULL ⚠️⚠️⚠️");
            return null;
        }

        if (value == null)
        {
            _logger.LogWarning($"⚠️⚠️⚠️ Value es NULL para atributo: {attribute.Name} ⚠️⚠️⚠️");
            return null;
        }


        _logger.LogInformation($"📋📋📋 Atributo recibido: Name='{attribute.Name}', Element='{attribute.Element?.Name}'");

            try
            {
                // ============================================
                // 1. VALIDAR CALIDAD
                // ============================================
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

                // ============================================
                // 2. VALIDAR QUE SEA NUMÉRICO
                // ============================================
                double numericValue;

                try
                {
                    numericValue = Convert.ToDouble(value.Value);
                }
                catch
                {
                    _logger.LogWarning(
                        "⚠️ Valor no numérico: {Attribute} = {Value}",
                        attribute.Name,
                        value.Value);
                    return null;
                }

                // ============================================
                // 3. OBTENER EL NOMBRE DEL TAG
                // ============================================
                string tagName = attribute.Name;
                
                // Si el nombre del atributo está vacío, usar el nombre del elemento
                if (string.IsNullOrWhiteSpace(tagName))
                {
                    var element = attribute.Element;
                    if (element != null)
                    {
                        tagName = element.Name;
                    }
                }
                
                // Si sigue vacío, usar el path (sin usar [^1])
                if (string.IsNullOrWhiteSpace(tagName))
                {
                    try
                    {
                        var path = attribute.GetPath();
                        if (!string.IsNullOrWhiteSpace(path))
                        {
                            var parts = path.Split('/');
                            tagName = parts.Length > 0 ? parts[parts.Length - 1] : "unknown";
                        }
                    }
                    catch { }
                }

                // Si sigue vacío, asignar un nombre por defecto
                if (string.IsNullOrWhiteSpace(tagName))
                {
                    tagName = $"PI_{Guid.NewGuid():N}";
                    _logger.LogWarning($"⚠️ Atributo sin nombre, asignando: {tagName}");
                }

                // ============================================
                // 4. OBTENER EL ELEMENTO
                // ============================================
                var elementObj = attribute.Element;

                // ============================================
                // 5. OBTENER TIMESTAMP
                DateTime timestamp;
                try
                {
                    timestamp = value.Timestamp.LocalTime;
                }
                catch
                {
                    timestamp = DateTime.UtcNow;
                }

                // ============================================
                // 7. CREAR EL READING - SIEMPRE CON TagName
                // ============================================
                var reading = new SensorReading
                {
                    EquipmentId = 0,
                    TagName = tagName,
                    Value = numericValue,
                    Unit = attribute.DefaultUOM?.Abbreviation ?? "N/A",
                    Quality = "Good",
                    Source = "PI_System",
                    Timestamp = timestamp,
                    PiServer = piServer,
                    Database = database,
                    ElementName = attribute.Element?.Name ?? "",
                    ElementPath = attribute.Element?.GetPath() ?? "",
                    AttributeName = attribute.Name,
                    PIPointName = GetPIPointName(attribute),
                    ValueType = value.Value?.GetType().Name
                };

                // ============================================
                // 8. LOG DE CONFIRMACIÓN
                // ============================================
                _logger.LogInformation("📊 PI EVENT: {TagName} = {Value} {Unit} (Elemento: {Element})",
                    reading.TagName,
                    reading.Value,
                    reading.Unit,
                    reading.ElementName);

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

        private string? GetPIPointName(AFAttribute attribute)
        {
            try
            {
                return attribute.DataReference?.PIPoint?.Name;
            }
            catch
            {
                return null;
            }
        }
    }
}