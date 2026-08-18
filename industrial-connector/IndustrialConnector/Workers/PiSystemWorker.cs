// Workers/PiSystemWorker.cs
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;
using IndustrialConnector.Services;

namespace IndustrialConnector.Workers;

public class PiSystemWorker : BackgroundService
{
    private readonly PiSystemService _pi;
    private readonly BufferService _buffer;
    private readonly HealthService _health;
    private readonly ILogger<PiSystemWorker> _logger;
    private readonly PiSystemConfig _config;
    private int _errorCount = 0;
    private const int MaxErrors = 3;

    public PiSystemWorker(
        PiSystemService pi,
        BufferService buffer,
        HealthService health,
        ILogger<PiSystemWorker> logger,
        IOptions<PiSystemConfig> config)
    {
        _pi = pi;
        _buffer = buffer;
        _health = health;
        _logger = logger;
        _config = config.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🔌 PI System Worker iniciado");

        // Intentar conectar a PI Web API
        var connected = _pi.Connect();
        _health.PiSystemConnected = connected;

        if (!connected)
        {
            _logger.LogError("❌ No se pudo conectar a PI Web API. El worker se detendrá.");
            return;
        }

        if (_config.Tags == null || !_config.Tags.Any())
        {
            _logger.LogWarning("⚠️ No hay tags configurados en appsettings.json");
            return;
        }

        _logger.LogInformation($"📊 Monitoreando {_config.Tags.Count} tags configurados");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var readings = await _pi.ReadAllTagsAsync();

                if (readings.Any())
                {
                    foreach (var reading in readings)
                    {
                        _buffer.Store(reading);
                    }
                    
                    _health.TotalReadings += readings.Count;
                    _health.LastReadAt = DateTime.UtcNow;
                    _health.BufferCount = _buffer.Count;
                    _errorCount = 0;

                    _logger.LogDebug("📦 {Count} lecturas almacenadas en buffer", readings.Count);
                }
                else
                {
                    _logger.LogWarning("⚠️ No se obtuvieron lecturas en este ciclo");
                }

                await Task.Delay(5000, stoppingToken);
            }
            catch (Exception ex)
            {
                _errorCount++;
                _logger.LogError(ex, $"❌ Error en ciclo ({_errorCount}/{MaxErrors})");

                if (_errorCount >= MaxErrors)
                {
                    _logger.LogCritical("💀 Demasiados errores. Reintentando conexión...");
                    _health.PiSystemConnected = false;
                    
                    await Task.Delay(10000, stoppingToken);
                    connected = _pi.Connect();
                    _health.PiSystemConnected = connected;
                    _errorCount = 0;
                }

                await Task.Delay(5000, stoppingToken);
            }
        }
        
        _logger.LogInformation("🛑 PI System Worker detenido");
    }
}