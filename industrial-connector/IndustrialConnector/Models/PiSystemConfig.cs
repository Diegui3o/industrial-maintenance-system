using System.Collections.Generic;

namespace IndustrialConnector.Models
{
    public class PiSystemConfig
    {
        public string Server { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Database { get; set; } = "BD El Porvenir";
        public string RootElement { get; set; } = "7937 - El Porvenir";
        public bool AutoDiscover { get; set; } = true;
        public List<TagConfig> Tags { get; set; } = new List<TagConfig>();
    }

    public class TagConfig
    {
        public int EquipmentId { get; set; }
        public string ElementPath { get; set; } = string.Empty;
        public string AttributeName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public double? LowAlarm { get; set; }
        public double? HighAlarm { get; set; }
    }
}