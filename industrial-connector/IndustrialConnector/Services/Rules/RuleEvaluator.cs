using System;
using System.Collections.Generic;
using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Services.Rules
{
    public class RuleEvaluator
    {
        private readonly ILogger<RuleEvaluator> _logger;
        private readonly Dictionary<string, ReglaAlarma> _reglas;
        private readonly HashSet<string> _tagsEnAlarma =
            new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        public RuleEvaluator(
            ILogger<RuleEvaluator> logger,
            IOptions<List<ReglaAlarma>> reglas)
        {
            _logger = logger;
            _reglas = new Dictionary<string, ReglaAlarma>(
                StringComparer.OrdinalIgnoreCase);

            if (reglas?.Value != null)
            {
                foreach (var r in reglas.Value)
                {
                    if (r == null) continue;
                    if (!r.Habilitada) continue;
                    if (string.IsNullOrWhiteSpace(r.TagName)) continue;

                    if (r.Minimo == null && r.Maximo == null)
                    {
                        _logger.LogWarning(
                            "Regla sin Minimo ni Maximo ignorada: {Tag}",
                            r.TagName);
                        continue;
                    }

                    _reglas[r.TagName.Trim()] = r;
                }
            }

            _logger.LogInformation(
                "RuleEvaluator cargado con {N} reglas activas.",
                _reglas.Count);

            foreach (var kv in _reglas)
            {
                _logger.LogInformation(
                    "  Regla: {Clave} | Min: {Min} | Max: {Max}",
                    kv.Key,
                    kv.Value.Minimo?.ToString() ?? "-",
                    kv.Value.Maximo?.ToString() ?? "-");
            }
        }

        // Clave unica por tag: ElementPath + "/" + AttributeName.
        // Si falta alguna parte, cae a un fallback razonable.
        private string ObtenerClave(SensorReading r)
        {
            var elementPath = (r.ElementPath ?? string.Empty).Trim();
            var attributeName = (r.AttributeName ?? string.Empty).Trim();

            if (!string.IsNullOrWhiteSpace(elementPath) &&
                !string.IsNullOrWhiteSpace(attributeName))
            {
                return $"{elementPath}/{attributeName}";
            }

            // Fallback por si ElementPath no esta disponible
            var elementName = (r.ElementName ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(elementName) &&
                !string.IsNullOrWhiteSpace(attributeName))
            {
                return $"{elementName}/{attributeName}";
            }

            return (r.TagName ?? string.Empty).Trim();
        }

        public DecisionAlarma Evaluar(SensorReading reading)
        {
            if (reading == null) return DecisionAlarma.Ninguna;

            var clave = ObtenerClave(reading);
            if (string.IsNullOrWhiteSpace(clave))
                return DecisionAlarma.Ninguna;

            if (!_reglas.TryGetValue(clave, out var regla))
                return DecisionAlarma.Ninguna;

            // Ignorar valores de calidad distinta a "Good"
            if (!string.Equals(
                    reading.Quality,
                    "Good",
                    StringComparison.OrdinalIgnoreCase))
            {
                return DecisionAlarma.Ninguna;
            }

            var fueraDeRango = false;
            if (regla.Minimo.HasValue && reading.Value < regla.Minimo.Value)
                fueraDeRango = true;
            if (regla.Maximo.HasValue && reading.Value > regla.Maximo.Value)
                fueraDeRango = true;

            var enAlarma = _tagsEnAlarma.Contains(clave);

            if (fueraDeRango && !enAlarma)
            {
                _tagsEnAlarma.Add(clave);
                _logger.LogWarning(
                    "ALARMA ABIERTA: {Clave} = {Val} {Unit} | Rango [{Min}, {Max}]",
                    clave,
                    reading.Value,
                    reading.Unit ?? "",
                    regla.Minimo?.ToString() ?? "-",
                    regla.Maximo?.ToString() ?? "-");
                return DecisionAlarma.Abrir;
            }

            if (!fueraDeRango && enAlarma)
            {
                _tagsEnAlarma.Remove(clave);
                _logger.LogInformation(
                    "ALARMA CERRADA: {Clave} = {Val} {Unit}",
                    clave,
                    reading.Value,
                    reading.Unit ?? "");
                return DecisionAlarma.Cerrar;
            }

            return DecisionAlarma.Ninguna;
        }
    }
}