using System.Collections.Concurrent;
using IndustrialConnector.Models;
using IndustrialConnector.Services;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Workers;

/// <summary>
/// Worker de SOLO LECTURA para OPC UA.
/// Usa suscripciones (no polling) para leer hasta 3000 tags.
/// </summary>
public class OpcUaWorker : BackgroundService
{
    private readonly BufferService _buffer;
    private readonly HealthService _health;
    private readonly ILogger<OpcUaWorker> _logger;
    private readonly ConcurrentDictionary<string, double> _lastValues = new();

    public OpcUaWorker(
        BufferService buffer,
        HealthService health,
        ILogger<OpcUaWorker> logger)
    {
        _buffer = buffer;
        _health = health;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OPC UA Worker iniciado (SOLO LECTURA)");

        // TODO: Implementar cuando estés en la máquina con OPC UA disponible
        // using Opc.Ua.Client;
        // var client = new Opc.Ua.Client.Session(...);
        // client.Subscribe(tags, OnDataChanged);

        while (!stoppingToken.IsCancellationRequested)
        {
            _health.OpcUaConnected = false; // Cambiar a true cuando se implemente
            await Task.Delay(10000, stoppingToken);
        }
    }

    private void OnDataChanged(dynamic tag, dynamic value, DateTime timestamp, string quality)
    {
        var reading = new SensorReading
        {
            EquipmentId = 1, // Mapear desde configuración
            TagName = tag.Name,
            Value = Convert.ToDouble(value),
            Unit = tag.Unit ?? "",
            Quality = quality,
            Source = "OPC_UA",
            Timestamp = timestamp
        };

        _buffer.Store(reading);
        _health.TotalReadings++;
        _health.LastReadAt = DateTime.UtcNow;
    }
}