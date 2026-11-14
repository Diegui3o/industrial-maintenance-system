using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using IndustrialConnector.Services;

namespace IndustrialConnector.Services.Export
{
    public class CatalogSyncService
    {
        private readonly ExporterService _exporter;
        private readonly ILogger<CatalogSyncService> _logger;

        public CatalogSyncService(
            ExporterService exporter,
            ILogger<CatalogSyncService> logger)
        {
            _exporter = exporter;
            _logger = logger;
        }

        public async Task<bool> SincronizarCatalogoAsync(
            List<PiAttributeInfo> atributos,
            string endpointSync)
        {
            if (atributos == null || atributos.Count == 0)
            {
                _logger.LogWarning(
                    "Catálogo vacío, no se sincroniza con el backend.");
                return false;
            }

            // Mapear PiAttributeInfo → TagSyncPayload
            var payload = atributos
                .Where(a => a.IsDataReference) // solo tags que apuntan a PI Points
                .Select(a => new TagSyncPayload
                {
                    TagName = a.AttributeName,
                    ElementName = a.ElementName,
                    ElementPath = a.ElementPath,
                    PiPointName = a.FullPath,
                    PiServer = a.PiServer,
                    DatabaseName = a.Database,
                    Unidad = a.Unit ?? string.Empty,
                    AttributeName = a.AttributeName,
                    Source = "PI_System"
                })
                .ToList();

            _logger.LogInformation(
                "Sincronizando {Count} tags con el backend ({Url})...",
                payload.Count, endpointSync);

            string json;
            try
            {
                json = JsonSerializer.Serialize(payload);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error serializando catálogo a JSON.");
                return false;
            }

            var ok = await _exporter.SendDataAsync(json, endpointSync);

            if (ok)
            {
                _logger.LogInformation(
                    "✅ Catálogo sincronizado con el backend: {Count} tags.",
                    payload.Count);
            }
            else
            {
                _logger.LogError(
                    "❌ No se pudo sincronizar el catálogo con el backend.");
            }

            return ok;
        }
    }
}