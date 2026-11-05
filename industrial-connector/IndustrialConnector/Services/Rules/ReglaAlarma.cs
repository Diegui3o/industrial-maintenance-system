namespace IndustrialConnector.Services.Rules
{
    public class ReglaAlarma
    {
        public string TagName { get; set; } = string.Empty;
        public double? Minimo { get; set; }
        public double? Maximo { get; set; }
        public string? Unidad { get; set; }
        public bool Habilitada { get; set; } = true;
    }

    public enum DecisionAlarma
    {
        Ninguna = 0,
        Abrir = 1,
        Cerrar = 2
    }
}