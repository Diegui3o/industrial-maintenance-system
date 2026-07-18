using System.Collections.Concurrent;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services;

/// <summary>
/// Buffer en memoria. Si el backend Go no responde, los datos quedan aquí.
/// NADA se escribe a disco. Solo lectura del buffer.
/// </summary>
public class BufferService
{
    private readonly ConcurrentQueue<SensorReading> _buffer = new();
    private readonly int _maxSize;

    public BufferService(int maxSize = 10000)
    {
        _maxSize = maxSize;
    }

    public void Store(SensorReading reading)
    {
        _buffer.Enqueue(reading);
        
        // Si el buffer crece demasiado, elimina los más viejos
        while (_buffer.Count > _maxSize)
        {
            _buffer.TryDequeue(out _);
        }
    }

    public List<SensorReading> Flush(int batchSize)
    {
        var batch = new List<SensorReading>();
        
        for (int i = 0; i < batchSize; i++)
        {
            if (_buffer.TryDequeue(out var reading))
            {
                batch.Add(reading);
            }
            else
            {
                break;
            }
        }
        
        return batch;
    }

    public int Count => _buffer.Count;
}