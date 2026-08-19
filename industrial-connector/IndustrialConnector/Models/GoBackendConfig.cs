namespace IndustrialConnector.Models
{
    public class GoBackendConfig
    {
        public string BaseUrl { get; set; } = "http://10.30.37.165:1883";
        public string ApiKey { get; set; } = "mto_e169a8";
        public string Endpoint { get; set; } = "/api/v1/eventos/sensor";
        public int BatchSize { get; set; } = 50;
        public int SendIntervalMs { get; set; } = 5000;
    }

    public class BufferConfig
    {
        public int MaxSize { get; set; } = 10000;
        public int FlushIntervalSeconds { get; set; } = 30;
    }
}