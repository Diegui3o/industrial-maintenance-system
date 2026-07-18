namespace IndustrialConnector.Models;

public class OpcUaConfig
{
    public string Name { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public bool UseSecurity { get; set; } = false;
    public int SamplingIntervalMs { get; set; } = 1000;
}

public class PiSystemConfig
{
    public string Server { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string WebApiUrl { get; set; } = string.Empty;
    public List<TagConfig> Tags { get; set; } = new();
}

public class TagConfig
{
    public int EquipmentId { get; set; }
    public string Path { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class GoBackendConfig
{
    public string BaseUrl { get; set; } = string.Empty;
    public int BatchSize { get; set; } = 500;
    public int SendIntervalMs { get; set; } = 1000;
}