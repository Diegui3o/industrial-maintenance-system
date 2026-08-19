using System;

namespace IndustrialConnector.Services
{
    public class HealthService
    {
        public bool PiSystemConnected { get; private set; }

        public int TotalReadings { get; private set; }

        public int SentReadings { get; private set; }

        public int BufferCount { get; private set; }

        public DateTime? LastReadAt { get; private set; }

        public DateTime? LastSendAt { get; private set; }

        public DateTime StartedAt { get; } = DateTime.UtcNow;

        // =========================================================
        // PI SYSTEM
        // =========================================================

        public void SetPiSystemConnected(bool connected)
        {
            PiSystemConnected = connected;
        }

        // =========================================================
        // LECTURAS
        // =========================================================

        public void RegisterReadings(int count, int bufferCount)
        {
            TotalReadings += count;
            BufferCount = bufferCount;
            LastReadAt = DateTime.UtcNow;
        }

        // =========================================================
        // ENVÍOS
        // =========================================================

        public void RegisterSentReadings(int count, int bufferCount)
        {
            SentReadings += count;
            BufferCount = bufferCount;
            LastSendAt = DateTime.UtcNow;
        }

        // =========================================================
        // BUFFER
        // =========================================================

        public void UpdateBufferCount(int count)
        {
            BufferCount = count;
        }
    }
}