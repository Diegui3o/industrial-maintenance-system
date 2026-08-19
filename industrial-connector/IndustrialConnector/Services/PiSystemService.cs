using System;
using System.Linq;
using System.Threading.Tasks;
using OSIsoft.AF;
using OSIsoft.AF.PI;
using OSIsoft.AF.Asset;
using IndustrialConnector.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IndustrialConnector.Services
{
    public class PiSystemService : IDisposable
    {
        private readonly ILogger<PiSystemService> _logger;
        private readonly PiSystemConfig _config;

        private PISystems? _piSystems;
        private PISystem? _piSystem;
        private PIServer? _server;
        private AFDatabase? _database;
        private AFElement? _rootElement;

        private bool _connected;

        public PiSystemService(
            ILogger<PiSystemService> logger,
            IOptions<PiSystemConfig> options)
        {
            _logger = logger;
            _config = options.Value;
        }

        public bool Connect()
        {
            try
            {
                _logger.LogInformation(
                    "Conectando a PI System mediante AF SDK...");

                // =====================================================
                // 1. Obtener la colección de PI Systems conocidos
                // =====================================================
                _piSystems = new PISystems();

                if (_piSystems.Count == 0)
                {
                    _logger.LogError(
                        "No se encontraron PI Systems configurados en esta PC.");
                    return false;
                }

                _logger.LogInformation(
                    "PI Systems encontrados: {Count}",
                    _piSystems.Count);

                // =====================================================
                // 2. Buscar el AF Server
                // =====================================================
                _piSystem = null;

                foreach (PISystem system in _piSystems)
                {
                    _logger.LogInformation(
                        "PI System disponible: {Name}",
                        system.Name);

                    if (string.Equals(
                        system.Name,
                        _config.Server,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        _piSystem = system;
                        break;
                    }
                }

                // Si no encontró el configurado, utilizar DefaultPISystem
                if (_piSystem == null)
                {
                    _logger.LogWarning(
                        "No se encontró el PI System '{Server}'. " +
                        "Se utilizará DefaultPISystem.",
                        _config.Server);

                    _piSystem = _piSystems.DefaultPISystem;
                }

                if (_piSystem == null)
                {
                    _logger.LogError(
                        "No se pudo obtener un PISystem.");
                    return false;
                }

                _logger.LogInformation(
                    "AF Server seleccionado: {Name}",
                    _piSystem.Name);

                // =====================================================
                // 3. Conectar al AF Server
                // =====================================================
                if (!_piSystem.IsConnected)
                {
                    _piSystem.Connect();
                }

                if (!_piSystem.IsConnected)
                {
                    _logger.LogError(
                        "No se pudo conectar al AF Server: {Name}",
                        _piSystem.Name);
                    return false;
                }

                _logger.LogInformation(
                    "AF Server conectado: {Name} - versión {Version}",
                    _piSystem.Name,
                    _piSystem.Version);

                // =====================================================
                // 4. Buscar PI Data Archive
                // =====================================================
                try
                {
                    _server = PIServer.FindPIServer(
                        _piSystem,
                        _config.Server);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "No se pudo encontrar el PI Server '{Server}' " +
                        "usando el nombre configurado.",
                        _config.Server);
                }

                // Si no lo encontró por nombre, intentar con
                // DefaultPIServerName del AF Server.
                if (_server == null &&
                    !string.IsNullOrWhiteSpace(_piSystem.DefaultPIServerName))
                {
                    try
                    {
                        _server = PIServer.FindPIServer(
                            _piSystem,
                            _piSystem.DefaultPIServerName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(
                            ex,
                            "No se pudo encontrar el PI Server por " +
                            "DefaultPIServerName.");
                    }
                }

                if (_server == null)
                {
                    _logger.LogError(
                        "No se pudo encontrar ningún PI Data Archive.");
                    return false;
                }

                // =====================================================
                // 5. Conectar al PI Data Archive
                // =====================================================
                _server.Connect();

                _logger.LogInformation(
                    "PI Data Archive conectado: {Server} - versión {Version}",
                    _server.Name,
                    _server.ServerVersion);

                // =====================================================
                // 6. Buscar AF Database
                // =====================================================
                _database = null;

                if (!string.IsNullOrWhiteSpace(_config.Database))
                {
                    _database = _piSystem.Databases[_config.Database];
                }

                if (_database == null)
                {
                    _logger.LogWarning(
                        "No se encontró la AF Database '{Database}'. " +
                        "Se utilizará la primera disponible.",
                        _config.Database);

                    _database = _piSystem.Databases.FirstOrDefault();
                }

                if (_database == null)
                {
                    _logger.LogError(
                        "No se encontró ninguna AF Database.");
                    return false;
                }

                _logger.LogInformation(
                    "AF Database seleccionada: {Database}",
                    _database.Name);

                // =====================================================
                // 7. Buscar elemento raíz
                // =====================================================
                _rootElement = null;

                if (!string.IsNullOrWhiteSpace(_config.RootElement))
                {
                    _rootElement =
                        _database.Elements[_config.RootElement];
                }

                if (_rootElement == null)
                {
                    _logger.LogWarning(
                        "No se encontró el elemento raíz '{Element}'. " +
                        "Se utilizará el primer elemento disponible.",
                        _config.RootElement);

                    _rootElement =
                        _database.Elements.FirstOrDefault();
                }

                if (_rootElement == null)
                {
                    _logger.LogError(
                        "No se encontró ningún elemento en la AF Database.");
                    return false;
                }

                _logger.LogInformation(
                    "Elemento raíz: {Element}",
                    _rootElement.Name);

                _connected = true;

                _logger.LogInformation(
                    "PI System conectado correctamente.");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error conectando a PI System.");

                _connected = false;

                return false;
            }
        }

        public async Task<double?> ReadAttributeValue(
            string elementPath,
            string attributeName)
        {
            if (!_connected ||
                _piSystem == null ||
                _database == null)
            {
                _logger.LogWarning(
                    "PI System no está conectado.");

                return null;
            }

            try
            {
                AFElement? targetElement = null;

                // =====================================================
                // Buscar primero desde el elemento raíz
                // =====================================================
                if (_rootElement != null)
                {
                    if (string.Equals(
                        _rootElement.Name,
                        elementPath,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        targetElement = _rootElement;
                    }
                    else
                    {
                        foreach (AFElement child in _rootElement.Elements)
                        {
                            if (string.Equals(
                                child.Name,
                                elementPath,
                                StringComparison.OrdinalIgnoreCase))
                            {
                                targetElement = child;
                                break;
                            }
                        }
                    }
                }

                // =====================================================
                // Si no está directamente debajo del raíz,
                // intentar buscar por ruta/nombre dentro de la DB.
                // =====================================================
                if (targetElement == null)
                {
                    try
                    {
                        targetElement =
                            _database.Elements[elementPath];
                    }
                    catch
                    {
                        // Se mantiene null y se informa abajo.
                    }
                }

                if (targetElement == null)
                {
                    _logger.LogWarning(
                        "Elemento no encontrado: {Element}",
                        elementPath);

                    return null;
                }

                // =====================================================
                // Buscar atributo
                // =====================================================
                AFAttribute? attribute =
                    targetElement.Attributes[attributeName];

                if (attribute == null)
                {
                    _logger.LogWarning(
                        "Atributo no encontrado: {Element}/{Attribute}",
                        elementPath,
                        attributeName);

                    return null;
                }

                // =====================================================
                // Leer valor actual
                // =====================================================
                AFValue value = attribute.GetValue();

                if (value == null)
                {
                    _logger.LogWarning(
                        "El atributo devolvió un valor nulo: {Attribute}",
                        attributeName);

                    return null;
                }

                // =====================================================
                // AF SDK 4.0: comprobar IsGood
                // =====================================================
                if (!value.IsGood)
                {
                    _logger.LogWarning(
                        "Valor no válido para {Element}/{Attribute}. " +
                        "Status: {Status}",
                        elementPath,
                        attributeName,
                        value.Status);

                    return null;
                }

                if (value.Value == null)
                {
                    _logger.LogWarning(
                        "El valor del atributo es nulo: {Attribute}",
                        attributeName);

                    return null;
                }

                return Convert.ToDouble(value.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error leyendo {Element}/{Attribute}",
                    elementPath,
                    attributeName);

                return null;
            }
        }

        public bool IsConnected
        {
            get
            {
                return _connected;
            }
        }

        public void Dispose()
        {
            try
            {
                if (_server != null)
                {
                    try
                    {
                        _server.Disconnect();
                    }
                    catch
                    {
                        // Ignorar errores durante la desconexión.
                    }
                }

                if (_piSystem != null &&
                    _piSystem.IsConnected)
                {
                    try
                    {
                        _piSystem.Disconnect();
                    }
                    catch
                    {
                        // Ignorar errores durante la desconexión.
                    }
                }
            }
            finally
            {
                _server = null;
                _database = null;
                _rootElement = null;
                _piSystem = null;
                _piSystems = null;
                _connected = false;
            }
        }
    }
}