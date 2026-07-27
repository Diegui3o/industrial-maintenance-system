using IndustrialConnector.Services;
using IndustrialConnector.Models;

namespace IndustrialConnector.Workers;

public class PiSystemWorker : BackgroundService
{
    private readonly PiSystemService _pi;
    private readonly BufferService _buffer;
    private readonly HealthService _health;
    private readonly ILogger<PiSystemWorker> _logger;

    public PiSystemWorker(
        PiSystemService pi,
        BufferService buffer,
        HealthService health,
        ILogger<PiSystemWorker> logger)
    {
        _pi = pi;
        _buffer = buffer;
        _health = health;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PI System Worker iniciado (SOLO LECTURA)");

        // Intentar conectar al AF Server
        var connected = _pi.Connect();
        _health.PiSystemConnected = connected;

        if (!connected)
        {
            _logger.LogWarning("Usando modo simulación hasta que se restaure la conexión");
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var value = await _pi.ReadValueAsync(new TagConfig { 
                    Name = "sinusoid", 
                    Path = @"\\PEELPWVPIAP01NX\sinusoid" 
                });

                var reading = new SensorReading
                {
                    EquipmentId = 1,
                    TagName = "sinusoid",
                    Value = value,
                    Unit = "°C",
                    Quality = "Good",
                    Source = "PI_System",
                    Timestamp = DateTime.UtcNow
                };

                _buffer.Store(reading);
                _health.TotalReadings++;
                _health.LastReadAt = DateTime.UtcNow;
                _health.BufferCount = _buffer.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leyendo PI System");
                _health.PiSystemConnected = false;
            }

            await Task.Delay(5000, stoppingToken);
        }
    }
}