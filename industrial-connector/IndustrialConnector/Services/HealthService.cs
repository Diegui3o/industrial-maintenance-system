namespace IndustrialConnector.Services;

public class HealthService
{
    public bool PiSystemConnected { get; set; }
    public int TotalReadings { get; set; }
    public int SentReadings { get; set; }
    public int BufferCount { get; set; }
    public DateTime? LastReadAt { get; set; }
    public DateTime? LastSendAt { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
}