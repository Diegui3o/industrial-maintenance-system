// Models/PiSystemConfig.cs
namespace IndustrialConnector.Models;

public class PiSystemConfig
{
    public string ServerUrl { get; set; } = "https://PEELPWVPIAP01NX/piwebapi";
    public string ServerName { get; set; } = "PEELPWVPIAP01NX";
    public string Username { get; set; } = "svc_readonly";
    public string Password { get; set; } = "";
    public string Database { get; set; } = "BD El Porvenir";
    public string RootElement { get; set; } = "7937 - El Porvenir";
    public bool AutoDiscover { get; set; } = false;
    public List<TagConfig> Tags { get; set; } = new();
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