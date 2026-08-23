using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using IndustrialConnector.Models;
using IndustrialConnector.Services;

namespace IndustrialConnector.Workers
{
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
                    _health.UpdateBufferCount(_buffer.Count);

                    if (batch.Count > 0)
                    {
                        var success = await SendBatchAsync(batch);
                        if (success)
                        {
                            _logger.LogInformation("✅ Enviados {Count} eventos al backend | Buffer: {Buffer}",
                                batch.Count, _buffer.Count);
                        }
                        else
                        {
                            _logger.LogWarning("⚠️ Falló envío de {Count} eventos, reintentando", batch.Count);
                            // Los eventos ya se devolvieron al buffer dentro de SendBatchAsync
                        }
                    }

                    await Task.Delay(_config.SendIntervalMs, stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error en ciclo de Batch Sender");
                    await Task.Delay(5000, stoppingToken);
                }
            }

            _logger.LogInformation("📤 Batch Sender detenido");
        }

        private async Task<bool> SendBatchAsync(List<SensorReading> batch)
        {
            if (batch == null || batch.Count == 0)
                return true;

            try
            {
                var json = JsonSerializer.Serialize(batch, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                });

                if (json.Length > 0)
                {
                    var preview = json.Length > 500 ? json.Substring(0, 500) + "..." : json;
                    _logger.LogInformation($"📤 JSON a enviar: {preview}");
                }

                var success = await _exporter.SendDataAsync(
                    json,
                    _config.ApiKey,
                    _config.Endpoint
                );

                if (success)
                {

                    _health.RegisterSentReadings(batch.Count, _buffer.Count);
                    _health.UpdateBufferCount(_buffer.Count);
                    return true;
                }
                else
                {
                    foreach (var item in batch)
                        _buffer.Store(item);
                    _health.UpdateBufferCount(_buffer.Count);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error enviando batch");
                foreach (var item in batch)
                    _buffer.Store(item);
                _health.UpdateBufferCount(_buffer.Count);
                return false;
            }
        }
    }
}