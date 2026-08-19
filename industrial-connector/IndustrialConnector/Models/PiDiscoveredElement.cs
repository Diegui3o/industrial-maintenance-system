using System.Collections.Generic;

namespace IndustrialConnector.Models
{
    public class PiDiscoveredElement
    {
        public string Name { get; set; } = string.Empty;

        public string Path { get; set; } = string.Empty;

        public string Database { get; set; } = string.Empty;

        public string RootElement { get; set; } = string.Empty;

        public List<PiDiscoveredAttribute> Attributes { get; set; }
            = new List<PiDiscoveredAttribute>();
    }
}