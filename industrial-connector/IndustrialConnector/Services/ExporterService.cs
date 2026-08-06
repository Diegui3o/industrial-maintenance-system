using System.Net.Http.Json;
using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;

namespace IndustrialConnector.Services;

/// <summary>
/// Envía datos al backend Go. SOLO ENVÍA, nunca recibe ni modifica.
/// </summary>
public class ExporterService
{
    private readonly HttpClient _http;
    private readonly ILogger<ExporterService> _logger;

    public ExporterService(HttpClient http, ILogger<ExporterService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task SendBatchAsync(List<SensorReading> batch)
    {
        if (batch.Count == 0) return;

        try
        {
            var response = await _http.PostAsJsonAsync("/api/v1/eventos/sensor", batch);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogDebug("Enviados {Count} registros al backend Go", batch.Count);
            }
            else
            {
                _logger.LogWarning("Backend Go respondió {StatusCode}", (int)response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enviando datos al backend Go");
            throw; // Relanzar para que el worker reintente
        }
    }
}