using System.Reflection;
using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Services;

public class PiSystemService : IDisposable
{
    private readonly ILogger<PiSystemService> _logger;
    private readonly PiSystemConfig _config;
    private object? _piSystem;
    private object? _server;
    private bool _connected;

    private static readonly string[] AfSdkPaths = new[]
    {
        @"C:\Program Files (x86)\PIPC\AF\PublicAssemblies\4.0\OSIsoft.AFSDK.dll",
        @"C:\Program Files\PIPC\AF\PublicAssemblies\4.0\OSIsoft.AFSDK.dll"
    };

    public PiSystemService(ILogger<PiSystemService> logger, IOptions<PiSystemConfig> options)
    {
        _logger = logger;
        _config = options.Value;
    }

    public bool Connect()
    {
        try
        {
            var dllPath = AfSdkPaths.FirstOrDefault(File.Exists);
            if (dllPath == null)
            {
                _logger.LogError("AF SDK no encontrado en las rutas conocidas");
                return false;
            }

            _logger.LogInformation("AF SDK encontrado: " + dllPath);

            var assembly = Assembly.LoadFrom(dllPath);
            var piSystemsType = assembly.GetType("OSIsoft.AF.PISystems");
            _piSystem = Activator.CreateInstance(piSystemsType!);
            
            _server = piSystemsType!.GetMethod("get_Item", new[] { typeof(string) })!
                .Invoke(_piSystem, new[] { _config.Server });

            if (_server == null)
            {
                _logger.LogWarning("Servidor no encontrado: " + _config.Server);
                _server = piSystemsType.GetMethod("get_Item", new[] { typeof(string) })!
                    .Invoke(_piSystem, new[] { "10.30.33.81" });
            }

            if (_server == null)
            {
                _logger.LogError("No se pudo conectar al servidor PI");
                return false;
            }

            var afServerProp = _server.GetType().GetProperty("AFServer");
            var afServer = afServerProp!.GetValue(_server);
            var versionProp = afServer!.GetType().GetProperty("Version");
            var version = versionProp!.GetValue(afServer);

            var serverVersionProp = _server.GetType().GetProperty("ServerVersion");
            var serverVersion = serverVersionProp!.GetValue(_server);

            _logger.LogInformation("CONECTADO a PI System. AF SDK: " + version + ", Archive: " + serverVersion);

            // Listar bases de datos
            try
            {
                var databasesProp = _server.GetType().GetProperty("Databases");
                var databases = databasesProp!.GetValue(_server) as System.Collections.IEnumerable;
                if (databases != null)
                {
                    _logger.LogInformation("Bases de datos:");
                    foreach (var db in databases)
                    {
                        var nameProp = db.GetType().GetProperty("Name");
                        var dbName = nameProp!.GetValue(db)?.ToString() ?? "?";
                        _logger.LogInformation("  - " + dbName);
                    }
                }
            }
            catch { }

            _connected = true;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error conectando a PI System");
            return false;
        }
    }

    public async Task<double> ReadValueAsync(TagConfig tag)
    {
        if (!_connected || _server == null)
        {
            return Math.Round(50 + Random.Shared.NextDouble() * 30, 2);
        }

        try
        {
            var piPointType = _server.GetType().Assembly.GetType("OSIsoft.AF.PI.PIPoint");
            var findMethod = piPointType!.GetMethod("FindPIPoint", new[] { _server.GetType(), typeof(string) });
            var point = findMethod!.Invoke(null, new[] { _server, tag.Path });

            if (point == null) return 0;

            var snapshotMethod = point.GetType().GetMethod("Snapshot");
            var snapshot = snapshotMethod!.Invoke(point, null);
            var valueProp = snapshot!.GetType().GetProperty("Value");
            var value = valueProp!.GetValue(snapshot);

            _logger.LogTrace("Tag " + tag.Name + " = " + value);
            return Convert.ToDouble(value);
        }
        catch
        {
            return 0;
        }
    }

    public bool IsConnected => _connected;

    public void Dispose()
    {
        _piSystem = null;
        _server = null;
        _connected = false;
    }
}