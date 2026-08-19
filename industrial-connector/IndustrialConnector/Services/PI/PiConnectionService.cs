using System;
using Microsoft.Extensions.Logging;
using OSIsoft.AF;

namespace IndustrialConnector.Services.PI
{
    public class PiConnectionService : IDisposable
    {
        private readonly ILogger<PiConnectionService> _logger;

        private PISystems? _piSystems;
        private PISystem? _piSystem;

        public PiConnectionService(
            ILogger<PiConnectionService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// PI System actualmente conectado.
        /// </summary>
        public PISystem? PiSystem => _piSystem;

        /// <summary>
        /// Indica si existe una conexión activa con AF Server.
        /// </summary>
        public bool IsConnected
        {
            get
            {
                return _piSystem != null &&
                       _piSystem.ConnectionInfo.IsConnected;
            }
        }

        /// <summary>
        /// Conecta al PI System configurado como predeterminado
        /// en el AF SDK instalado en Windows.
        /// </summary>
        public bool Connect()
        {
            try
            {
                _logger.LogInformation(
                    "🔌 Conectando a PI System mediante AF SDK...");

                _piSystems = new PISystems();

                if (_piSystems.Count == 0)
                {
                    _logger.LogError(
                        "❌ No se encontraron PI Systems configurados en el AF SDK.");

                    return false;
                }

                _logger.LogInformation(
                    "PI Systems encontrados: {Count}",
                    _piSystems.Count);

                _piSystem = _piSystems.DefaultPISystem;

                if (_piSystem == null)
                {
                    _logger.LogError(
                        "❌ No existe un PI System predeterminado.");

                    return false;
                }

                _logger.LogInformation(
                    "AF Server seleccionado: {Name}",
                    _piSystem.Name);

                // Conectar solamente si todavía no está conectado.
                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _piSystem.Connect();
                }

                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _logger.LogError(
                        "❌ No se pudo establecer conexión con AF Server: {Name}",
                        _piSystem.Name);

                    return false;
                }

                _logger.LogInformation(
                    "✅ AF Server conectado: {Name} - versión {Version}",
                    _piSystem.Name,
                    _piSystem.ServerVersion);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error conectando a PI System.");

                return false;
            }
        }

        /// <summary>
        /// Obtiene el PI System conectado.
        /// Lanza excepción si no existe conexión.
        /// </summary>
        public PISystem GetPiSystem()
        {
            if (_piSystem == null ||
                !_piSystem.ConnectionInfo.IsConnected)
            {
                throw new InvalidOperationException(
                    "PI System no está conectado.");
            }

            return _piSystem;
        }

        public void Disconnect()
        {
            try
            {
                if (_piSystem != null &&
                    _piSystem.ConnectionInfo.IsConnected)
                {
                    _piSystem.Disconnect();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "⚠️ Error desconectando de PI System.");
            }
            finally
            {
                _piSystem = null;
                _piSystems = null;
            }
        }

        public void Dispose()
        {
            Disconnect();
        }
    }
}