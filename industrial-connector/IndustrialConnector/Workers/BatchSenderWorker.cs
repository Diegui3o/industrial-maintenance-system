using IndustrialConnector.Models;
using IndustrialConnector.Services;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Workers;

public class BatchSenderWorker : BackgroundService
{
    private readonly BufferService _buffer;
    private readonly ExporterService _exporter;
    private readonly HealthService _health;
    private readonly GoBackendConfig _config;
    private readonly ILogger<BatchSenderWorker> _logger;

    public BatchSenderWorker(
        BufferService buffer,
        ExporterService exporter,
        HealthService health,
        IOptions<GoBackendConfig> config,
        ILogger<BatchSenderWorker> logger)
    {
        _buffer = buffer;
        _exporter = exporter;
        _health = health;
        _config = config.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Batch Sender iniciado. Enviando cada {Interval}ms", _config.SendIntervalMs);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var batch = _buffer.Flush(_config.BatchSize);

                if (batch.Count > 0)
                {
                    await _exporter.SendBatchAsync(batch);
                    _health.TotalSent += batch.Count;
                    _health.LastSentAt = DateTime.UtcNow;
                    _health.GoBackendReachable = true;
                    _logger.LogDebug("Lote enviado: {Count} registros", batch.Count);
                }
            }
            catch (Exception ex)
            {
                _health.GoBackendReachable = false;
                _logger.LogWarning(ex, "Error enviando lote. Reintentando...");
            }
            
            _health.BufferCount = _buffer.Count;
            await Task.Delay(_config.SendIntervalMs, stoppingToken);
        }
    }
}