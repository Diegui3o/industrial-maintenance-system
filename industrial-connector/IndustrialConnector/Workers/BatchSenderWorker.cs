using System.Text;
using System.Text.Json;
using IndustrialConnector.Models;
using IndustrialConnector.Services;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Workers;

public class BatchSenderWorker : BackgroundService
{
    private readonly ILogger<BatchSenderWorker> _logger;
    private readonly BufferService _buffer;
    private readonly ExporterService _exporter;
    private readonly HealthService _health;
    private readonly GoBackendConfig _config;
    private readonly int _batchSize;

    public BatchSenderWorker(
        ILogger<BatchSenderWorker> logger,
        BufferService buffer,
        ExporterService exporter,
        HealthService health,
        IOptions<GoBackendConfig> config)
    {
        _logger = logger;
        _buffer = buffer;
        _exporter = exporter;
        _health = health;
        _config = config.Value;
        _batchSize = _config.BatchSize > 0 ? _config.BatchSize : 50;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("📤 Batch Sender iniciado");
        _logger.LogInformation("📦 Batch size: {BatchSize}, Intervalo: {Interval}ms", 
            _batchSize, _config.SendIntervalMs);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var batch = _buffer.GetBatch(_batchSize);
                
                if (batch.Any())
                {
                    await SendBatchAsync(batch);
                }

                await Task.Delay(_config.SendIntervalMs, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error en Batch Sender");
                await Task.Delay(5000, stoppingToken);
            }
        }
    }

    private async Task SendBatchAsync(List<SensorReading> batch)
    {
        try
        {
            var events = batch.Select(r => new
            {
                equipment_id = r.EquipmentId,
                tag_name = r.TagName,
                value = Math.Round(r.Value, 3),
                unit = r.Unit,
                quality = r.Quality,
                source = r.Source,
                timestamp = r.Timestamp.ToString("o")
            });

            var json = JsonSerializer.Serialize(events);
            _logger.LogDebug("📤 Enviando {Count} eventos", batch.Count);

            var success = await _exporter.SendDataAsync(json, _config.ApiKey);
            
            if (success)
            {
                _logger.LogInformation("✅ Enviados {Count} eventos al backend", batch.Count);
                _health.SentReadings += batch.Count;
                _health.LastSendAt = DateTime.UtcNow;
                _health.BufferCount = _buffer.Count;
            }
            else
            {
                _logger.LogWarning("⚠️ Falló envío de {Count} eventos, reintentando", batch.Count);
                foreach (var item in batch)
                {
                    _buffer.Store(item);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error enviando batch");
            foreach (var item in batch)
            {
                _buffer.Store(item);
            }
        }
    }
}