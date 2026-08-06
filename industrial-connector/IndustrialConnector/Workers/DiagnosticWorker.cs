using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Services;

namespace IndustrialConnector.Workers;

/// <summary>
/// Worker de diagnóstico inicial.
/// Detecta qué servicios están disponibles en la máquina.
/// </summary>
public class DiagnosticWorker : BackgroundService
{
    private readonly ILogger<DiagnosticWorker> _logger;
    private readonly HealthService _health;

    public DiagnosticWorker(ILogger<DiagnosticWorker> logger, HealthService health)
    {
        _logger = logger;
        _health = health;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("========================================");
        _logger.LogInformation("   DIAGNÓSTICO DEL SISTEMA");
        _logger.LogInformation("========================================");

        // 1. Detectar AF SDK (PI System)
        var afSdkPaths = new[]
        {
            @"C:\Program Files (x86)\PIPC\AF\PublicAssemblies\4.0\OSIsoft.AFSDK.dll",
            @"C:\Program Files\PIPC\AF\PublicAssemblies\4.0\OSIsoft.AFSDK.dll"
        };

        var afSdkFound = false;
        foreach (var path in afSdkPaths)
        {
            if (File.Exists(path))
            {
                _logger.LogInformation("✅ AF SDK encontrado: {Path}", path);
                afSdkFound = true;
            }
        }
        if (!afSdkFound)
        {
            _logger.LogWarning("❌ AF SDK NO encontrado. PI System no estará disponible.");
            _logger.LogWarning("   Buscado en: {Paths}", string.Join(", ", afSdkPaths));
        }

        // 2. Detectar red (ping a destinos clave)
        _logger.LogInformation("---");
        _logger.LogInformation("Prueba de conectividad de red:");

        var targets = new Dictionary<string, string>
        {
            { "Backend Go", "10.30.33" },
            { "PI System (posible)", "10.30.33.81" },
            { "Google DNS (internet)", "8.8.8.8" }
        };

        foreach (var target in targets)
        {
            try
            {
                var ping = new System.Net.NetworkInformation.Ping();
                var reply = await ping.SendPingAsync(target.Value, 2000);
                if (reply.Status == System.Net.NetworkInformation.IPStatus.Success)
                {
                    _logger.LogInformation("✅ {Name} ({IP}) - {Latency}ms", 
                        target.Key, target.Value, reply.RoundtripTime);
                }
                else
                {
                    _logger.LogWarning("⚠️ {Name} ({IP}) - {Status}", 
                        target.Key, target.Value, reply.Status);
                }
            }
            catch
            {
                _logger.LogWarning("❌ {Name} ({IP}) - No accesible", target.Key, target.Value);
            }
        }

        // 3. Detectar si esta máquina tiene doble NIC
        _logger.LogInformation("---");
        _logger.LogInformation("Interfaces de red:");
        foreach (var nic in System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces())
        {
            if (nic.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up)
            {
                var ipProps = nic.GetIPProperties();
                foreach (var ip in ipProps.UnicastAddresses)
                {
                    if (ip.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    {
                        _logger.LogInformation("   {Name}: {IP}", nic.Name, ip.Address);
                    }
                }
            }
        }

        // 4. Determinar si esta máquina puede ser puente
        var ips = System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()
            .Where(n => n.OperationalStatus == System.Net.NetworkInformation.OperationalStatus.Up)
            .SelectMany(n => n.GetIPProperties().UnicastAddresses)
            .Where(a => a.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
            .Select(a => a.Address.ToString())
            .ToList();

        var hasOtNetwork = ips.Any(i => i.StartsWith("192.168."));
        var hasItNetwork = ips.Any(i => i.StartsWith("10.30."));

        if (hasOtNetwork && hasItNetwork)
        {
            _logger.LogInformation("✅ Esta máquina TIENE doble red (OT + IT). Puede ser puente.");
        }
        else if (hasOtNetwork)
        {
            _logger.LogInformation("⚠️ Esta máquina SOLO tiene red OT (192.168.x.x).");
            _logger.LogInformation("   Necesita acceso al backend Go en 10.30.33:1880.");
        }
        else if (hasItNetwork)
        {
            _logger.LogInformation("⚠️ Esta máquina SOLO tiene red IT (10.30.x.x).");
            _logger.LogInformation("   No podrá acceder a PI System en 192.168.x.x.");
        }
        else
        {
            _logger.LogWarning("❌ No se detectaron redes OT ni IT.");
        }

        // 5. Resumen
        _logger.LogInformation("---");
        _logger.LogInformation("RESUMEN:");
        _logger.LogInformation("   AF SDK: {Status}", afSdkFound ? "Disponible" : "NO disponible");
        _logger.LogInformation("   Red OT (192.168.x.x): {Status}", hasOtNetwork ? "SI" : "NO");
        _logger.LogInformation("   Red IT (10.30.x.x): {Status}", hasItNetwork ? "SI" : "NO");
        _logger.LogInformation("   Puede ser puente: {Status}", (hasOtNetwork && hasItNetwork) ? "SI" : "NO");
        _logger.LogInformation("========================================");

        _health.LastDiagAt = DateTime.UtcNow;
        
        await Task.CompletedTask;
    }
}