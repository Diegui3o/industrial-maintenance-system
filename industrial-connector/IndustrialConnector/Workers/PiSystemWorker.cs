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
        private readonly PiDataPipeService _dataPipe;
        private int _errorCount = 0;

        private const int MaxErrors = 3;

        public PiSystemWorker(
            PiConnectionService connection,
            PiDatabaseService database,
            PiDiscoveryService discovery,
            PiAttributeDiscoveryService attributeDiscovery,
            PiAttributeClassifierService classifier,
            PiAttributeReaderService reader,
            PiDataPipeService dataPipe,
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
            _dataPipe = dataPipe;
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
            // 7. CONSTRUIR LISTA REAL DE ATRIBUTOS
            // =====================================================

            var monitoredAttributes =
                new List<AFAttribute>();

            foreach (var element in elements)
            {
                foreach (AFAttribute attribute in element.Attributes)
                {
                    if (attribute.DataReference == null)
                    {
                        continue;
                    }

                    var fullPath =
                        $"{element.GetPath()}/{attribute.Name}";

                    if (!monitoredPaths.Contains(fullPath))
                    {
                        continue;
                    }

                    monitoredAttributes.Add(attribute);
                }
            }

            _logger.LogInformation(
                "👁️ Atributos enviados a DataPipe: {Count}",
                monitoredAttributes.Count);

            // =====================================================
            // 8. INICIALIZAR DATAPIPE
            // =====================================================

            if (!_dataPipe.Initialize(monitoredAttributes))
            {
                _logger.LogError(
                    "❌ No se pudo inicializar AFDataPipe.");

                _health.SetPiSystemConnected(false);

                return;
            }

            _logger.LogInformation(
                "🚀 Monitoreo PI mediante AFDataPipe iniciado.");

            // =====================================================
            // 9. CICLO DE EVENTOS
            // =====================================================

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var events =
                        _dataPipe.GetEvents();

                    var readings =
                        new List<SensorReading>();

                    foreach (var dataPipeEvent in events)
                    {
                        try
                        {
                            var attribute =
                                dataPipeEvent.Value?.Attribute;

                            var value =
                                dataPipeEvent.Value;

                            if (attribute == null ||
                                value == null)
                            {
                                continue;
                            }

                            var reading =
                                _reader.Read(
                                    attribute,
                                    value,
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
                                "⚠️ Error procesando evento DataPipe.");
                        }
                    }

                    foreach (var reading in readings)
                    {
                        _buffer.Store(reading);
                    }

                    if (readings.Count > 0)
                    {
                        _health.RegisterReadings(
                            readings.Count,
                            _buffer.Count);

                        _logger.LogInformation(
                            "📡 Eventos PI recibidos: {Count} | Buffer: {Buffer}",
                            readings.Count,
                            _buffer.Count);
                    }

                    _errorCount = 0;

                    // -------------------------------------------------
                    // El DataPipe se consulta periódicamente.
                    // No se vuelve a consultar el valor del atributo.
                    // -------------------------------------------------

                    await Task.Delay(
                        TimeSpan.FromMilliseconds(500),
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
                        "❌ Error en DataPipe PI. Intento {Count}/{Max}",
                        _errorCount,
                        MaxErrors);

                    if (_errorCount >= MaxErrors)
                    {
                        _health.SetPiSystemConnected(false);

                        _logger.LogError(
                            "❌ Demasiados errores consecutivos en DataPipe.");
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