using System;
using System.Text.Json.Serialization;

namespace IndustrialConnector.Models
{
    public class TagSyncPayload
    {
        [JsonPropertyName("tag_name")]
        public string TagName { get; set; } = string.Empty;

        [JsonPropertyName("element_name")]
        public string ElementName { get; set; } = string.Empty;

        [JsonPropertyName("element_path")]
        public string ElementPath { get; set; } = string.Empty;

        [JsonPropertyName("pi_point_name")]
        public string PiPointName { get; set; } = string.Empty;

        [JsonPropertyName("pi_server")]
        public string PiServer { get; set; } = string.Empty;

        [JsonPropertyName("database_name")]
        public string DatabaseName { get; set; } = string.Empty;

        [JsonPropertyName("unidad")]
        public string Unidad { get; set; } = string.Empty;

        [JsonPropertyName("source")]
        public string Source { get; set; } = "PI_System";

        [JsonPropertyName("attribute_name")]
        public string AttributeName { get; set; } = string.Empty;
    }
}