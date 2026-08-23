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
            // ============================================
            // 1. VALIDAR QUE EXISTA EL ATRIBUTO
            // ============================================
            if (attribute == null)
            {
                return null;
            }

            // ============================================
            // 2. OBTENER EL ELEMENTO (SIEMPRE)
            // ============================================
            var element = attribute.Element;
            if (element == null)
            {
                _logger.LogDebug($"⏭️ Atributo sin elemento: {attribute.Name}");
                return null;
            }

            // ============================================
            // 3. OBTENER NOMBRE DEL TAG
            // ============================================
            string tagName = attribute.Name ?? "TAG_SIN_NOMBRE";

            // ============================================
            // 4. CAPTURAR JERARQUÍA COMPLETA
            // ============================================
            var rutaCompleta = new List<string>();
            var elementoActual = element;

            // Usar un enfoque diferente para obtener el parent
            while (elementoActual != null)
            {
                rutaCompleta.Insert(0, elementoActual.Name);
                
                // Intentar obtener el Parent como AFElement
                try
                {
                    // Usar reflexión o la propiedad correcta
                    var parentProperty = elementoActual.GetType().GetProperty("Parent");
                    if (parentProperty != null)
                    {
                        elementoActual = parentProperty.GetValue(elementoActual) as AFElement;
                    }
                    else
                    {
                        // Si no tiene Parent, salir
                        elementoActual = null;
                    }
                }
                catch
                {
                    elementoActual = null;
                }
            }
            
            string pathJerarquico = string.Join(" → ", rutaCompleta);
            int nivel = rutaCompleta.Count;
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

            // ============================================
            // 5. OBTENER VALOR (SIEMPRE, aunque sea nulo)
            // ============================================
            double numericValue = 0;
            bool hasValue = false;
            string quality = "NoValue";
            string valueType = "Unknown";

            if (value != null)
            {
                quality = value.IsGood ? "Good" : value.Status.ToString();
                
                if (value.Value != null)
                {
                    try
                    {
                        numericValue = Convert.ToDouble(value.Value);
                        hasValue = true;
                        valueType = value.Value.GetType().Name;
                    }
                    catch
                    {
                        // No es numérico, pero guardamos el tag igual
                        hasValue = false;
                        valueType = value.Value.GetType().Name;
                        _logger.LogDebug($"⚠️ Valor no numérico: {tagName} = {value.Value}");
                    }
                }
            }

            // ============================================
            // 6. OBTENER UNIDAD
            // ============================================
            string unidad = attribute.DefaultUOM?.Abbreviation ?? "N/A";

            // ============================================
            // 7. OBTENER TIMESTAMP
            // ============================================
            DateTime timestamp = DateTime.UtcNow;
            try
            {
                if (value?.Timestamp != null)
                {
                    timestamp = value.Timestamp.LocalTime;
                }
            }
            catch { }

            // ============================================
            // 8. CREAR EL READING - SIEMPRE
            // ============================================
            var reading = new SensorReading
            {
                EquipmentId = 0,
                TagName = tagName,
                Value = hasValue ? numericValue : 0,
                Unit = unidad,
                Quality = quality,
                Source = "PI_System",
                Timestamp = timestamp,

                // === JERARQUÍA ===
                PiServer = piServer,
                Database = database,
                RootElement = rutaCompleta.FirstOrDefault() ?? "",
                ElementName = element.Name ?? "",
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
                "📊 PI: {Tag} = {Value} {Unit} | 📁 {Ruta}",
                reading.TagName,
                hasValue ? reading.Value.ToString() : "SIN VALOR",
                reading.Unit,
                reading.RutaCompleta);

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