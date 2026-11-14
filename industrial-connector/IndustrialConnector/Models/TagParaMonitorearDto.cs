using System.Text.Json.Serialization;

namespace IndustrialConnector.Models
{
    public class TagParaMonitorearDto
    {
        [JsonPropertyName("umbral_id")]
        public int UmbralId { get; set; }

        [JsonPropertyName("equipo_id")]
        public int EquipoId { get; set; }

        [JsonPropertyName("equipo_nombre")]
        public string EquipoNombre { get; set; } = string.Empty;

        [JsonPropertyName("tag_id")]
        public int TagId { get; set; }

        [JsonPropertyName("parametro")]
        public string Parametro { get; set; } = string.Empty;

        [JsonPropertyName("element_path")]
        public string ElementPath { get; set; } = string.Empty;

        [JsonPropertyName("attribute_name")]
        public string AttributeName { get; set; } = string.Empty;

        [JsonPropertyName("tag_name")]
        public string TagName { get; set; } = string.Empty;

        [JsonPropertyName("unidad")]
        public string Unidad { get; set; } = string.Empty;
    }
}