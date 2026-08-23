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
using OSIsoft.AF.Data;

namespace IndustrialConnector.Workers
{
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
        private const int ReadIntervalSeconds = 5;

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
                "🔌 PI System Worker iniciado - MONITOREO CONTROLADO");

            // =====================================================
            // 1. CONEXIÓN CON PI SYSTEM
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

            _logger.LogInformation(
                "✅ Conexión con PI System establecida.");

            // =====================================================
            // 2. OBTENER AF DATABASE
            // =====================================================

            var database =
                _database.GetDatabase(_config.Database);

            if (database == null)
            {
                _logger.LogError(
                    "❌ No se pudo obtener la AF Database: {Database}",
                    _config.Database);

                return;
            }

            _logger.LogInformation(
                "✅ AF Database seleccionada: {Database}",
                database.Name);

            // =====================================================
            // 3. OBTENER ELEMENTO RAÍZ
            // =====================================================

            var rootElement =
                database.Elements[_config.RootElement];

            if (rootElement == null)
            {
                _logger.LogError(
                    "❌ No se encontró el elemento raíz: {RootElement}",
                    _config.RootElement);

                return;
            }

            _logger.LogInformation(
                "✅ Elemento raíz: {RootElement}",
                rootElement.Name);

            var attributeInfos =
                _attributeDiscovery.DiscoverAttributes(
                    new[] { rootElement }
                        .SelectMany(GetAllElements),
                    _config.Server,
                    _config.Database);

            // =====================================================
            // 6. CLASIFICAR
            // =====================================================

            var classified =
                _classifier.ClassifyAll(attributeInfos);

            var criticalCount =
                classified[PiAttributePriority.Critical].Count;

            var importantCount =
                classified[PiAttributePriority.Important].Count;

            var normalCount =
                classified[PiAttributePriority.Normal].Count;

            var ignoreCount =
                classified[PiAttributePriority.Ignore].Count;

            _logger.LogInformation(
                "📊 Clasificación PI | Total: {Total} | Critical: {Critical} | Important: {Important} | Normal: {Normal} | Ignore: {Ignore}",
                attributeInfos.Count,
                criticalCount,
                importantCount,
                normalCount,
                ignoreCount);

            // =====================================================
            // 7. SELECCIONAR ATRIBUTOS MONITOREABLES
            // =====================================================

            var monitoredInfos =
                classified[PiAttributePriority.Critical]
                    .Concat(
                        classified[PiAttributePriority.Important])
                    .ToList();

            _logger.LogInformation(
                "🎯 Atributos seleccionados para monitoreo: {Count}",
                monitoredInfos.Count);

            if (monitoredInfos.Count == 0)
            {
                _logger.LogWarning(
                    "⚠️ El clasificador no encontró atributos Critical/Important.");

                return;
            }

            // =====================================================
            // 8. MAPEAR PiAttributeInfo → AFAttribute
            // =====================================================

            var monitoredAttributes =
                ResolveAFAttributes(
                    rootElement,
                    monitoredInfos);

            _logger.LogInformation(
                "🎯 AF Attributes válidos para lectura: {Count}",
                monitoredAttributes.Count);

            if (monitoredAttributes.Count == 0)
            {
                _logger.LogWarning(
                    "⚠️ No se pudieron resolver atributos PI monitoreables.");

                return;
            }
            _logger.LogInformation(
                "📡 Inicializando AFDataPipe con {Count} atributos...",
                monitoredAttributes.Count);

            var pipeInitialized =
                _dataPipe.Initialize(monitoredAttributes);

            if (!pipeInitialized)
            {
                _logger.LogError(
                    "❌ No se pudo inicializar AFDataPipe.");

                return;
            }

            _logger.LogInformation(
                "✅ AFDataPipe inicializado correctamente. Atributos registrados: {Count}",
                _dataPipe.RegisteredCount);
                
            // =====================================================
            // 10. CICLO DE MONITOREO MEDIANTE AFDataPipe
            // =====================================================

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var events = _dataPipe.GetEvents();

                    if (events.HasErrors)
                    {
                        foreach (var error in events.Errors)
                        {
                            _logger.LogError(
                                error.Value,
                                "❌ Error en AFDataPipe para atributo {Attribute}",
                                error.Key.Name);
                        }
                    }

                    if (events.Count > 0)
                    {
                        var readings =
                            new List<SensorReading>();

                        foreach (var pipeEvent in events.Results)
                        {
                            try
                            {
                                if (pipeEvent == null)
                                {
                                    continue;
                                }

                                var value = pipeEvent.Value;

                                if (value == null)
                                {
                                    continue;
                                }

                                var attribute = value.Attribute;

                                if (attribute == null)
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
                                _logger.LogDebug(
                                    ex,
                                    "⚠️ Error procesando evento AFDataPipe.");
                            }
                        }

                        foreach (var reading in readings)
                        {
                            _buffer.Store(reading);
                        }

                        _health.UpdateBufferCount(
                            _buffer.Count);

                        if (readings.Count > 0)
                        {
                            _health.RegisterReadings(
                                readings.Count,
                                _buffer.Count);

                            _logger.LogInformation(
                                "📡 AFDataPipe: {Events} eventos | {Readings} lecturas | Buffer: {Buffer}",
                                events.Count,
                                readings.Count,
                                _buffer.Count);
                        }
                    }

                    _errorCount = 0;

                    await Task.Delay(
                        TimeSpan.FromSeconds(1),
                        stoppingToken);
                }
                catch (OperationCanceledException)
                    when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _errorCount++;

                    _logger.LogError(
                        ex,
                        "❌ Error en ciclo AFDataPipe. Error {ErrorCount}/{MaxErrors}",
                        _errorCount,
                        MaxErrors);

                    if (_errorCount >= MaxErrors)
                    {
                        _logger.LogError(
                            "❌ Se alcanzó el máximo de errores consecutivos en AFDataPipe.");

                        break;
                    }
                }
            }

            _logger.LogInformation(
                "🛑 PI System Worker detenido.");
        }

        // =========================================================
        // DESCUBRIMIENTO RECURSIVO DE ELEMENTOS
        // =========================================================

        private List<AFElement> DiscoverAllElements(
            AFElement root)
        {
            var result =
                new List<AFElement>();

            AddElementRecursive(
                root,
                result);

            return result;
        }

        private void AddElementRecursive(
            AFElement element,
            List<AFElement> result)
        {
            if (element == null)
            {
                return;
            }

            result.Add(element);

            foreach (AFElement child in element.Elements)
            {
                AddElementRecursive(
                    child,
                    result);
            }
        }

        private IEnumerable<AFElement> GetAllElements(
            AFElement root)
        {
            return DiscoverAllElements(root);
        }

        // =========================================================
        // DESCUBRIMIENTO DE ATRIBUTOS AF
        // =========================================================

        private List<AFAttribute> DiscoverAllAttributes(
            AFElement root)
        {
            var attributes =
                new List<AFAttribute>();

            foreach (var element
                in DiscoverAllElements(root))
            {
                try
                {
                    foreach (AFAttribute attribute
                        in element.Attributes)
                    {
                        if (attribute != null)
                        {
                            attributes.Add(attribute);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(
                        ex,
                        "⚠️ Error descubriendo atributos del elemento {Element}",
                        element.Name);
                }
            }

            return attributes;
        }

        // =========================================================
        // RESOLVER ATRIBUTOS CLASIFICADOS
        // =========================================================

        private List<AFAttribute> ResolveAFAttributes(
            AFElement root,
            IEnumerable<PiAttributeInfo> monitoredInfos)
        {
            var monitored =
                new List<AFAttribute>();

            var lookup =
                new HashSet<string>(
                    monitoredInfos.Select(
                        x => x.FullPath),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var element
                in DiscoverAllElements(root))
            {
                try
                {
                    foreach (AFAttribute attribute
                        in element.Attributes)
                    {
                        if (attribute == null)
                        {
                            continue;
                        }

                        var fullPath =
                            $"{element.GetPath()}/{attribute.Name}";

                        if (lookup.Contains(fullPath))
                        {
                            monitored.Add(attribute);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(
                        ex,
                        "⚠️ Error resolviendo atributos del elemento {Element}",
                        element.Name);
                }
            }

            return monitored;
        }
    }
}