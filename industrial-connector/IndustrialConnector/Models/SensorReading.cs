namespace IndustrialConnector.Models;

public class SensorReading
{
    public int EquipmentId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Quality { get; set; } = "Good";
    public string Source { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}