using System;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OSIsoft.AF;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services.PI
{
    public class PiConnectionService : IDisposable
    {
        private readonly ILogger<PiConnectionService> _logger;
        private readonly PiSystemConfig _config;

        private PISystems? _piSystems;
        private PISystem? _piSystem;

        public PiConnectionService(
            ILogger<PiConnectionService> logger,
            IOptions<PiSystemConfig> options)
        {
            _logger = logger;
            _config = options.Value;
        }

        /// <summary>
        /// PI System actualmente conectado.
        /// </summary>
        public PISystem? PiSystem => _piSystem;

        /// <summary>
        /// Indica si existe una conexión activa con AF Server.
        /// </summary>
        public bool IsConnected =>
            _piSystem != null &&
            _piSystem.ConnectionInfo.IsConnected;

        /// <summary>
        /// Conecta al AF Server indicado en la configuración.
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
                        "❌ No se encontraron PI Systems configurados en AF SDK.");

                    return false;
                }

                _logger.LogInformation(
                    "PI Systems encontrados: {Count}",
                    _piSystems.Count);

                // ============================================
                // BUSCAR SERVIDOR CONFIGURADO
                // ============================================

                _piSystem = _piSystems[_config.Server];

                if (_piSystem == null)
                {
                    _logger.LogError(
                        "❌ No se encontró el AF Server configurado: {Server}",
                        _config.Server);

                    return false;
                }

                _logger.LogInformation(
                    "AF Server seleccionado: {Server}",
                    _piSystem.Name);

                // ============================================
                // CONECTAR
                // ============================================

                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _piSystem.Connect();
                }

                if (!_piSystem.ConnectionInfo.IsConnected)
                {
                    _logger.LogError(
                        "❌ No se pudo establecer conexión con AF Server: {Server}",
                        _piSystem.Name);

                    return false;
                }

                _logger.LogInformation(
                    "✅ AF Server conectado: {Server} - versión {Version}",
                    _piSystem.Name,
                    _piSystem.ServerVersion);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error conectando al AF Server: {Server}",
                    _config.Server);

                _piSystem = null;

                return false;
            }
        }

        /// <summary>
        /// Obtiene el PI System conectado.
        /// </summary>
        public PISystem GetPiSystem()
        {
            if (!IsConnected)
            {
                throw new InvalidOperationException(
                    "PI System no está conectado.");
            }

            return _piSystem!;
        }

        /// <summary>
        /// Desconecta del AF Server.
        /// </summary>
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