using System;
using System.Collections.Generic;
using System.Linq;
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

        public SensorReading? Read(
            AFAttribute attribute,
            AFValue value,
            string piServer,
            string database)
        {

            if (attribute == null)
            {
                return null;
            }

            var element = attribute.Element;
            if (element == null)
            {
                _logger.LogDebug($"⏭️ Atributo sin elemento: {attribute.Name}");
                return null;
            }

            string tagName = attribute.Name ?? "TAG_SIN_NOMBRE";
            var rutaCompleta = new List<string>();
            var elementoActual = element;
            var elementName = "";

            while (elementoActual != null)
            {
                rutaCompleta.Insert(0, elementoActual.Name);
                
                if (rutaCompleta.Count == 1)
                {
                    elementName = elementoActual.Name ?? "";
                }
                
                if (elementoActual is AFElement elem)
                {
                    elementoActual = elem.Parent;
                }
                else
                {
                    elementoActual = null;
                }
            }

            string pathJerarquico = string.Join(" → ", rutaCompleta);
            int nivel = rutaCompleta.Count;

            if (string.IsNullOrEmpty(elementName))
            {
                elementName = rutaCompleta.LastOrDefault() ?? "";
            }

            string elementoPadre = "";
            try
            {
                if (element is AFElement afElement && afElement.Parent != null)
                {
                    elementoPadre = afElement.Parent.Name ?? "";
                }
            }
            catch
            {
                elementoPadre = "";
            }

            double numericValue = 0;
            bool hasValue = false;
            string quality = "NoValue";
            string valueType = "Unknown";
            string rawValue = "";

            if (value != null && value.Value != null)
            {
                rawValue = value.Value.ToString() ?? "";
                valueType = value.Value.GetType().Name;

                try
                {
                    numericValue = Convert.ToDouble(value.Value);
                    hasValue = true;
                    quality = "Good";
                }
                catch
                {
                    hasValue = false;
                    quality = "Good";

                    _logger.LogDebug(
                        "⚠️ Valor no numérico: {Tag} = {Value}",
                        tagName,
                        rawValue);
                }
            }
            else
            {
                quality = "NoValue";
                rawValue = "null";
            }

            string unidad = attribute.DefaultUOM?.Abbreviation ?? "N/A";

            DateTime timestamp = DateTime.UtcNow;
            try
            {
                if (value?.Timestamp != null)
                {
                    timestamp = value.Timestamp.LocalTime;
                }
            }
            catch { }

            var reading = new SensorReading
            {
                EquipmentId = 0,
                TagName = tagName,
                Value = hasValue ? numericValue : 0,
                RawValue = rawValue,
                Unit = unidad,
                Quality = quality,
                Source = "PI_System",
                Timestamp = timestamp,

                // === JERARQUÍA ===
                PiServer = piServer,
                Database = database,
                RootElement = rutaCompleta.FirstOrDefault() ?? "",
                ElementName = elementName,
                ElementPath = element.GetPath() ?? "",
                AttributeName = attribute.Name ?? "",
                PIPointName = GetPIPointName(attribute) ?? "",
                ValueType = valueType,

                RutaCompleta = pathJerarquico,
                NivelJerarquico = nivel,
                ElementoPadre = elementoPadre,
                PathJerarquico = pathJerarquico,
                ElementosAncestros = string.Join("|", rutaCompleta)
            };

            _logger.LogDebug(
                "📊 PI: {Tag} = {Value} {Unit} | 📁 {Ruta} | 🔹 Element: {Element}",
                reading.TagName,
                hasValue ? reading.Value.ToString() : "SIN VALOR",
                reading.Unit,
                reading.RutaCompleta,
                reading.ElementName);

            return reading;
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