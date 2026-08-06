namespace IndustrialConnector.Services;

/// <summary>
/// Estado de salud del conector.
/// </summary>
public class HealthService
{
    public DateTime StartedAt { get; } = DateTime.UtcNow;
    public bool PiSystemConnected { get; set; }
    public bool OpcUaConnected { get; set; }
    public bool GoBackendReachable { get; set; }
    public int BufferCount { get; set; }
    public long TotalReadings { get; set; }
    public long TotalSent { get; set; }
    public DateTime LastReadAt { get; set; }
    public DateTime LastSentAt { get; set; }
    public DateTime LastDiagAt { get; set; }

    public object GetStatus()
    {
        return new
        {
            status = "running",
            uptime = (DateTime.UtcNow - StartedAt).ToString(@"dd\.hh\:mm\:ss"),
            workers = new
            {
                piSystem = PiSystemConnected ? "connected" : "disconnected",
                opcUa = OpcUaConnected ? "connected" : "disconnected",
                goBackend = GoBackendReachable ? "reachable" : "unreachable"
            },
            buffer = new
            {
                pending = BufferCount,
                totalRead = TotalReadings,
                totalSent = TotalSent
            },
            lastActivity = new
            {
                lastRead = LastReadAt.ToString("o"),
                lastSent = LastSentAt.ToString("o")
            }
        };
    }
}