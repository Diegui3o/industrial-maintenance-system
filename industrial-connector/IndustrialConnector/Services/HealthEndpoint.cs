using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace IndustrialConnector.Services;

public class HealthEndpoint
{
    private readonly HealthService _health;
    private readonly ILogger<HealthEndpoint> _logger;
    private readonly int _port;

    public HealthEndpoint(HealthService health, int port = 5000)
    {
        _health = health;
        _port = port;
        _logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<HealthEndpoint>();
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation($"🏥 Health endpoint en http://localhost:{_port}/health");
        _logger.LogWarning("ℹ️ Usa 'dotnet run' y navega a http://localhost:5000/health");
        
        // El endpoint de salud se mostrará en los logs
        await Task.CompletedTask;
    }
    
    // Método para obtener estado de salud como string
    public string GetHealthStatus()
    {
        var response = new
        {
            status = _health.PiSystemConnected ? "healthy" : "degraded",
            pi_system = new
            {
                connected = _health.PiSystemConnected,
                total_readings = _health.TotalReadings,
                sent_readings = _health.SentReadings,
                buffer_count = _health.BufferCount
            },
            timestamps = new
            {
                started = _health.StartedAt,
                last_read = _health.LastReadAt,
                last_send = _health.LastSendAt
            }
        };

        return JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true });
    }
}