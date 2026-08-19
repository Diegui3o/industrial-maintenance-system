using System;
using System.Collections.Generic;
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

            _batchSize =
                _config.BatchSize > 0
                    ? _config.BatchSize
                    : 50;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "📤 Batch Sender iniciado");

            _logger.LogInformation(
                "📦 Batch size: {BatchSize}, Intervalo: {Interval}ms",
                _batchSize,
                _config.SendIntervalMs);

            while (!stoppingToken.IsCancellationRequested)
            {
                var batch = new List<SensorReading>();

                try
                {
                    // =================================================
                    // OBTENER DATOS DEL BUFFER
                    // =================================================

                    batch = _buffer.GetBatch(_batchSize);

                    _health.UpdateBufferCount(_buffer.Count);

                    if (batch.Count == 0)
                    {
                        await Task.Delay(
                            _config.SendIntervalMs,
                            stoppingToken);

                        continue;
                    }

                    // =================================================
                    // ENVIAR LOTE
                    // =================================================

                    var success = await SendBatchAsync(batch);

                    if (success)
                    {
                        _health.RegisterSentReadings(
                            batch.Count,
                            _buffer.Count);

                        _logger.LogInformation(
                            "✅ Enviados {Count} eventos al backend | Buffer: {Buffer}",
                            batch.Count,
                            _buffer.Count);
                    }
                    else
                    {
                        _logger.LogWarning(
                            "⚠️ No se pudo enviar el lote de {Count} eventos",
                            batch.Count);

                        // Devolver datos al buffer
                        foreach (var item in batch)
                        {
                            _buffer.Store(item);
                        }

                        _health.UpdateBufferCount(
                            _buffer.Count);
                    }

                    await Task.Delay(
                        _config.SendIntervalMs,
                        stoppingToken);
                }
                catch (OperationCanceledException)
                    when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "❌ Falló envío de {Count} eventos",
                        batch.Count);

                    // =================================================
                    // DEVOLVER LOTE AL BUFFER
                    // =================================================

                    foreach (var item in batch)
                    {
                        _buffer.Store(item);
                    }

                    _health.UpdateBufferCount(
                        _buffer.Count);

                    try
                    {
                        await Task.Delay(
                            _config.SendIntervalMs,
                            stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                }
            }

            _logger.LogInformation(
                "📤 Batch Sender detenido");
        }

        // =========================================================
        // ENVIAR LOTE AL BACKEND
        // =========================================================

        private async Task<bool> SendBatchAsync(
            List<SensorReading> batch)
        {
            if (batch == null || batch.Count == 0)
            {
                return true;
            }

            try
            {
                var jsonData =
                    JsonSerializer.Serialize(batch);

                var success =
                    await _exporter.SendDataAsync(
                        jsonData,
                        _config.ApiKey);

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error serializando/enviando lote");

                return false;
            }
        }
    }
}