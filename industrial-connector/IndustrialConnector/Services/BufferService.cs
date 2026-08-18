using System.Collections.Concurrent;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services;

public class BufferService
{
    private readonly ConcurrentQueue<SensorReading> _queue = new();
    private readonly int _maxSize;
    private readonly ILogger<BufferService> _logger;

    public BufferService(ILogger<BufferService> logger, int maxSize = 10000)
    {
        _logger = logger;
        _maxSize = maxSize;
    }

    public void Store(SensorReading reading)
    {
        if (_queue.Count >= _maxSize)
        {
            _logger.LogWarning("⚠️ Buffer lleno ({MaxSize}), descartando lectura más antigua", _maxSize);
            _queue.TryDequeue(out _);
        }
        _queue.Enqueue(reading);
    }

    public List<SensorReading> GetBatch(int batchSize)
    {
        var batch = new List<SensorReading>();
        for (int i = 0; i < batchSize && _queue.TryDequeue(out var item); i++)
        {
            batch.Add(item);
        }
        return batch;
    }

    public int Count => _queue.Count;
    
    public void Clear()
    {
        while (_queue.TryDequeue(out _)) { }
    }
}