using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using IndustrialConnector.Models;
using IndustrialConnector.Services;
using IndustrialConnector.Services.PI;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Workers
{
    /// <summary>
    /// Worker principal encargado de:
    ///
    /// 1. Conectar al PI System.
    /// 2. Descubrir elementos.
    /// 3. Descubrir atributos.
    /// 4. Clasificar atributos.
    /// 5. Leer únicamente atributos monitoreables.
    /// 6. Colocar las lecturas en el buffer.
    ///
    /// No conoce detalles del backend Go.
    /// </summary>
    public class PiSystemWorker : BackgroundService
    {
        private readonly PiConnectionService _connection;
        private readonly PiDatabaseService _database;
        private readonly PiDiscoveryService _discovery;
        private readonly PiAttributeDiscoveryService _attributeDiscovery;
        private readonly PiAttributeClassifierService _classifier;
        private readonly PiAttributeReaderService _reader;
        private readonly BufferService _buffer;
        private readonly HealthService _health;
        private readonly ILogger<PiSystemWorker> _logger;
        private readonly PiSystemConfig _config;

        private int _errorCount = 0;

        private const int MaxErrors = 3;

        public PiSystemWorker(
            PiConnectionService connection,
            PiDatabaseService database,
            PiDiscoveryService discovery,
            PiAttributeDiscoveryService attributeDiscovery,
            PiAttributeClassifierService classifier,
            PiAttributeReaderService reader,
            BufferService buffer,
            HealthService health,
            ILogger<PiSystemWorker> logger,
            IOptions<PiSystemConfig> config)
        {
            _connection = connection;
            _database = database;
            _discovery = discovery;
            _attributeDiscovery = attributeDiscovery;
            _classifier = classifier;
            _reader = reader;
            _buffer = buffer;
            _health = health;
            _logger = logger;
            _config = config.Value;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "🔌 PI System Worker iniciado");

            // =====================================================
            // 1. CONEXIÓN
            // =====================================================

            if (!_connection.IsConnected)
            {
                var connected = _connection.Connect();

                _health.SetPiSystemConnected(connected);

                if (!connected)
                {
                    _logger.LogError(
                        "❌ No se pudo conectar al PI System.");

                    return;
                }
            }

            _health.SetPiSystemConnected(true);

            // =====================================================
            // 2. OBTENER DATABASE
            // =====================================================

            var database = _database.GetDatabase(
                _config.Database);

            if (database == null)
            {
                _logger.LogError(
                    "❌ No se pudo obtener la AF Database.");

                return;
            }

            // =====================================================
            // 3. DISCOVERY DE ELEMENTOS
            // =====================================================

            var elements = _discovery.DiscoverElements(
                _config.Database,
                _config.RootElement);

            _logger.LogInformation(
                "🔎 Elementos descubiertos: {Count}",
                elements.Count);

            if (elements.Count == 0)
            {
                _logger.LogWarning(
                    "⚠️ No se encontraron elementos.");

                return;
            }

            // =====================================================
            // 4. DISCOVERY DE ATRIBUTOS
            // =====================================================

            var attributeInfos =
                _attributeDiscovery.DiscoverAttributes(
                    elements,
                    _config.Server,
                    _config.Database);

            _logger.LogInformation(
                "🏷️ Atributos descubiertos: {Count}",
                attributeInfos.Count);

            // =====================================================
            // 5. CLASIFICACIÓN DE ATRIBUTOS
            // =====================================================

            var classified =
                _classifier.ClassifyAll(attributeInfos);

            var criticalCount =
                classified[PiAttributePriority.Critical].Count;

            var importantCount =
                classified[PiAttributePriority.Important].Count;

            var normalCount =
                classified[PiAttributePriority.Normal].Count;

            var ignoredCount =
                classified[PiAttributePriority.Ignore].Count;

            _logger.LogInformation(
                "📊 Clasificación PI: Critical={Critical}, Important={Important}, Normal={Normal}, Ignore={Ignore}",
                criticalCount,
                importantCount,
                normalCount,
                ignoredCount);

            // =====================================================
            // 6. CONSTRUIR ÍNDICE DE ATRIBUTOS MONITOREABLES
            // =====================================================
            //
            // Guardamos los FullPath que fueron clasificados como
            // Critical, Important o Normal.
            //
            // Ignore queda fuera del ciclo de lectura.

            var monitoredPaths =
                new HashSet<string>(
                    classified
                        .Where(x =>
                            x.Key == PiAttributePriority.Critical ||
                            x.Key == PiAttributePriority.Important ||
                            x.Key == PiAttributePriority.Normal)
                        .SelectMany(x => x.Value)
                        .Select(x => x.FullPath),
                    StringComparer.OrdinalIgnoreCase);

            _logger.LogInformation(
                "👁️ Atributos seleccionados para monitoreo: {Count}",
                monitoredPaths.Count);

            // =====================================================
            // 7. CICLO DE MONITOREO
            // =====================================================

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var readings =
                        new List<SensorReading>();

                    foreach (var element in elements)
                    {
                        foreach (AFAttribute attribute in element.Attributes)
                        {
                            try
                            {
                                // -------------------------------------------------
                                // Solo procesar atributos con referencia de datos.
                                // -------------------------------------------------

                                if (attribute.DataReference == null)
                                {
                                    continue;
                                }

                                // -------------------------------------------------
                                // Construir la misma ruta utilizada durante
                                // el discovery.
                                // -------------------------------------------------

                                var fullPath =
                                    $"{element.GetPath()}/{attribute.Name}";

                                // -------------------------------------------------
                                // Ignorar atributos que el clasificador
                                // determinó que no deben monitorearse.
                                // -------------------------------------------------

                                if (!monitoredPaths.Contains(fullPath))
                                {
                                    continue;
                                }

                                // -------------------------------------------------
                                // Leer valor.
                                // -------------------------------------------------

                                var reading =
                                    _reader.Read(
                                        element,
                                        attribute,
                                        _config.Server,
                                        _config.Database);

                                if (reading != null)
                                {
                                    readings.Add(reading);
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(
                                    ex,
                                    "⚠️ Error procesando {Element}/{Attribute}",
                                    element.Name,
                                    attribute.Name);
                            }
                        }
                    }

                    // =================================================
                    // 8. ENVIAR AL BUFFER
                    // =================================================

                    foreach (var reading in readings)
                    {
                        _buffer.Store(reading);
                    }

                    _health.RegisterReadings(
                        readings.Count,
                        _buffer.Count);

                    _logger.LogInformation(
                        "📊 Lecturas obtenidas: {Count} | Buffer: {Buffer}",
                        readings.Count,
                        _buffer.Count);

                    _errorCount = 0;

                    // =================================================
                    // 9. ESPERAR SIGUIENTE CICLO
                    // =================================================

                    await Task.Delay(
                        TimeSpan.FromSeconds(5),
                        stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _errorCount++;

                    _logger.LogError(
                        ex,
                        "❌ Error en ciclo PI. Intento {Count}/{Max}",
                        _errorCount,
                        MaxErrors);

                    if (_errorCount >= MaxErrors)
                    {
                        _health.SetPiSystemConnected(false);

                        _logger.LogError(
                            "❌ Demasiados errores consecutivos en PI.");
                    }

                    await Task.Delay(
                        TimeSpan.FromSeconds(5),
                        stoppingToken);
                }
            }

            _logger.LogInformation(
                "🛑 PI System Worker detenido.");
        }
    }
}