using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services
{
    public class BufferService
    {
        private readonly ConcurrentQueue<SensorReading> _queue =
        new ConcurrentQueue<SensorReading>();
        private readonly int _maxSize;

        public BufferService(int maxSize = 10000)
        {
            _maxSize = maxSize;
        }

        public void Store(SensorReading reading)
        {
            if (_queue.Count >= _maxSize)
            {
                Console.WriteLine($"⚠️ Buffer lleno ({_maxSize}), descartando lectura más antigua");
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
    }
}