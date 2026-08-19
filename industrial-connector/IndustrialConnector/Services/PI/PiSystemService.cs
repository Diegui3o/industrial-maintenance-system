using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OSIsoft.AF;
using OSIsoft.AF.Asset;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services
{
    public class PiSystemService : IDisposable
    {
        private readonly ILogger<PiSystemService> _logger;
        private readonly PiSystemConfig _config;

        private PISystem? _piSystem;
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
                    "🔌 Conectando a PI System mediante AF SDK...");

                // -------------------------------------------------
                // 1. Obtener los PI Systems conocidos por AF SDK
                // -------------------------------------------------

                var systems = new PISystems();

                _logger.LogInformation(
                    "PI Systems encontrados: {Count}",
                    systems.Count);

                if (systems.Count == 0)
                {
                    _logger.LogError(
                        "❌ No se encontraron PI Systems configurados.");

                    return false;
                }

                // -------------------------------------------------
                // 2. Buscar el AF Server configurado
                // -------------------------------------------------

                _piSystem = systems[_config.Server];

                if (_piSystem == null)
                {
                    _logger.LogError(
                        "❌ No se encontró el AF Server: {Server}",
                        _config.Server);

                    return false;
                }

                _logger.LogInformation(
                    "AF Server seleccionado: {Server}",
                    _piSystem.Name);

                // -------------------------------------------------
                // 3. Conectar al AF Server
                // -------------------------------------------------

                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _piSystem.Connect();
                }

                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _logger.LogError(
                        "❌ No se pudo conectar al AF Server: {Server}",
                        _piSystem.Name);

                    return false;
                }

                _logger.LogInformation(
                    "✅ AF Server conectado: {Server} - versión {Version}",
                    _piSystem.Name,
                    _piSystem.ServerVersion);

                // -------------------------------------------------
                // 4. Obtener AF Database
                // -------------------------------------------------

                _database = _piSystem.Databases[_config.Database];

                if (_database == null)
                {
                    _logger.LogError(
                        "❌ No se encontró la AF Database: {Database}",
                        _config.Database);

                    return false;
                }

                _logger.LogInformation(
                    "✅ AF Database seleccionada: {Database}",
                    _database.Name);

                // -------------------------------------------------
                // 5. Obtener elemento raíz
                // -------------------------------------------------

                _rootElement = _database.Elements[_config.RootElement];

                if (_rootElement == null)
                {
                    _logger.LogError(
                        "❌ No se encontró el elemento raíz: {RootElement}",
                        _config.RootElement);

                    return false;
                }

                _logger.LogInformation(
                    "✅ Elemento raíz: {RootElement}",
                    _rootElement.GetPath());

                _connected = true;

                _logger.LogInformation(
                    "✅ PI System conectado correctamente mediante AF SDK.");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error conectando a PI System.");

                _connected = false;

                return false;
            }
        }

        // =========================================================
        // BUSCAR ELEMENTO RECURSIVAMENTE
        // =========================================================

        private AFElement? FindElementRecursive(
            AFElement parent,
            string elementName)
        {
            // Buscar hijos directos
            foreach (AFElement child in parent.Elements)
            {
                if (string.Equals(
                    child.Name,
                    elementName,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return child;
                }
            }

            // Buscar recursivamente
            foreach (AFElement child in parent.Elements)
            {
                var result = FindElementRecursive(
                    child,
                    elementName);

                if (result != null)
                {
                    return result;
                }
            }

            return null;
        }

        // =========================================================
        // LEER ATRIBUTO
        // =========================================================

        public async Task<double?> ReadAttributeValue(
            string elementPath,
            string attributeName)
        {
            await Task.CompletedTask;

            if (!_connected || _rootElement == null)
            {
                _logger.LogWarning(
                    "⚠️ PI System no está conectado.");

                return null;
            }

            try
            {
                // -------------------------------------------------
                // Buscar elemento recursivamente
                // -------------------------------------------------

                var element = FindElementRecursive(
                    _rootElement,
                    elementPath);

                if (element == null)
                {
                    _logger.LogWarning(
                        "⚠️ Elemento no encontrado: {Element}",
                        elementPath);

                    return null;
                }

                // -------------------------------------------------
                // Buscar atributo
                // -------------------------------------------------

                var attribute = element.Attributes[attributeName];

                if (attribute == null)
                {
                    _logger.LogWarning(
                        "⚠️ Atributo no encontrado: {Element}/{Attribute}",
                        element.Name,
                        attributeName);

                    return null;
                }

                // -------------------------------------------------
                // Obtener valor mediante AF SDK
                // -------------------------------------------------

                AFValue value = attribute.GetValue();

                if (value == null)
                {
                    _logger.LogWarning(
                        "⚠️ Valor nulo: {Element}/{Attribute}",
                        element.Name,
                        attributeName);

                    return null;
                }

                // -------------------------------------------------
                // Verificar calidad
                // -------------------------------------------------

                if (!value.IsGood)
                {
                    _logger.LogWarning(
                        "⚠️ Calidad no válida: {Element}/{Attribute}",
                        element.Name,
                        attributeName);

                    return null;
                }

                var numericValue = Convert.ToDouble(value.Value);

                _logger.LogDebug(
                    "📊 PI {Element}/{Attribute} = {Value} @ {Timestamp}",
                    element.Name,
                    attributeName,
                    numericValue,
                    value.Timestamp);

                return numericValue;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error leyendo {Element}/{Attribute}",
                    elementPath,
                    attributeName);

                return null;
            }
        }
        public AFElement? RootElement
        {
            get
            {
                return _rootElement;
            }
        }

        public AFDatabase? Database
        {
            get
            {
                return _database;
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
                if (_piSystem != null &&
                    _piSystem.ConnectionInfo.IsConnected)
                {
                    _piSystem.Disconnect();
                }
            }
            catch
            {
                // No hacer fallar el cierre de la aplicación
            }

            _piSystem = null;
            _database = null;
            _rootElement = null;
            _connected = false;
        }
    }
}
