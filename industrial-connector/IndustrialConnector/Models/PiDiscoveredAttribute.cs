namespace IndustrialConnector.Models
{
    public class PiDiscoveredAttribute
    {
        public string Name { get; set; } = string.Empty;

        public string Path { get; set; } = string.Empty;

        public string? Unit { get; set; }

        public string? Description { get; set; }

        public string DataType { get; set; } = string.Empty;
    }
}