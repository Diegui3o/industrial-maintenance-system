using Aveva.AF;
using Aveva.AF.PI;
using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Services;

public class PiSystemService : IDisposable
{
    private readonly ILogger<PiSystemService> _logger;
    private readonly PiSystemConfig _config;
    private PISystem? _piSystem;
    private PIServer? _server;
    private AFDatabase? _database;
    private AFElement? _rootElement;
    private bool _connected;

    public PiSystemService(ILogger<PiSystemService> logger, IOptions<PiSystemConfig> options)
    {
        _logger = logger;
        _config = options.Value;
    }

    public bool Connect()
    {
        try
        {
            _logger.LogInformation($"🔌 Conectando a PI Server: {_config.Server} usando Aveva.AFSDK");

            // Crear instancia de PISystem
            _piSystem = new PISystem();
            
            // Conectar al servidor por nombre o IP
            _server = _piSystem.GetPIServer(_config.Server);
            if (_server == null)
            {
                _logger.LogError($"❌ Servidor no encontrado: {_config.Server}");
                return false;
            }

            // Conectar
            _server.Connect();
            if (!_server.IsConnected)
            {
                _logger.LogError($"❌ No se pudo conectar al servidor: {_config.Server}");
                return false;
            }

            _logger.LogInformation($"✅ Conectado a PI Server: {_config.Server}");
            _logger.LogInformation($"📌 Versión: {_server.ServerVersion}");

            // Obtener la base de datos
            _database = _server.Databases.FirstOrDefault(db => db.Name == _config.Database);
            if (_database == null)
            {
                _logger.LogWarning($"⚠️ Base de datos '{_config.Database}' no encontrada. Usando la primera disponible.");
                _database = _server.Databases.FirstOrDefault();
            }

            if (_database == null)
            {
                _logger.LogError("❌ No se encontró ninguna base de datos");
                return false;
            }

            _logger.LogInformation($"✅ Base de datos: {_database.Name}");

            // Obtener el elemento raíz
            _rootElement = _database.Elements.FirstOrDefault(e => e.Name == _config.RootElement);
            if (_rootElement == null)
            {
                _logger.LogWarning($"⚠️ Elemento raíz '{_config.RootElement}' no encontrado. Usando el primer elemento.");
                _rootElement = _database.Elements.FirstOrDefault();
            }

            if (_rootElement == null)
            {
                _logger.LogError("❌ No se encontró ningún elemento raíz");
                return false;
            }

            _logger.LogInformation($"✅ Elemento raíz: {_rootElement.Name}");
            _connected = true;
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error conectando a PI System");
            return false;
        }
    }

    public async Task<double?> ReadAttributeValue(string elementPath, string attributeName)
    {
        if (!_connected || _rootElement == null)
        {
            return null;
        }

        try
        {
            // Buscar el elemento hijo por nombre
            AFElement? targetElement = null;
            foreach (var child in _rootElement.Elements)
            {
                if (child.Name == elementPath)
                {
                    targetElement = child;
                    break;
                }
            }

            if (targetElement == null)
            {
                _logger.LogWarning($"⚠️ Elemento no encontrado: {elementPath}");
                return null;
            }

            // Buscar el atributo
            AFAttribute? attribute = null;
            foreach (var attr in targetElement.Attributes)
            {
                if (attr.Name == attributeName)
                {
                    attribute = attr;
                    break;
                }
            }

            if (attribute == null)
            {
                _logger.LogWarning($"⚠️ Atributo no encontrado: {attributeName} en {elementPath}");
                return null;
            }

            // Obtener el valor actual (snapshot)
            var value = attribute.GetValue();
            if (value == null)
            {
                _logger.LogWarning($"⚠️ No se pudo obtener valor de {attributeName}");
                return null;
            }

            // Verificar calidad si es posible
            if (value is AFValue afValue)
            {
                if (afValue.IsGood && afValue.Value != null)
                {
                    _logger.LogDebug($"📊 {elementPath}/{attributeName} = {afValue.Value}");
                    return Convert.ToDouble(afValue.Value);
                }
                else
                {
                    _logger.LogWarning($"⚠️ Calidad no buena para {attributeName}: {afValue.Quality}");
                    return null;
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"❌ Error leyendo {elementPath}/{attributeName}");
            return null;
        }
    }

    public bool IsConnected => _connected;

    public void Dispose()
    {
        try
        {
            _server?.Disconnect();
            _server?.Dispose();
            _piSystem?.Dispose();
        }
        catch { }
        _connected = false;
    }
}