using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using OSIsoft.AF;
using OSIsoft.AF.Asset;
using OSIsoft.AF.Data;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Administra AFDataPipe para recibir eventos de cambio
    /// de atributos PI/AF.
    ///
    /// Responsabilidades:
    /// - Registrar atributos con DataReference.
    /// - Recibir eventos iniciales.
    /// - Recibir cambios posteriores.
    /// - Exponer únicamente eventos AFDataPipeEvent.
    ///
    /// Este servicio no realiza lecturas masivas mediante GetValue().
    /// </summary>
    public class PiDataPipeService : IDisposable
    {
        private readonly ILogger<PiDataPipeService> _logger;

        private AFDataPipe? _pipe;

        private readonly List<AFAttribute> _attributes =
            new List<AFAttribute>();

        private bool _initialized;

        public PiDataPipeService(
            ILogger<PiDataPipeService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Registra los atributos seleccionados en AFDataPipe.
        /// Los atributos incompatibles se omiten individualmente.
        /// </summary>
        public bool Initialize(
            IEnumerable<AFAttribute> attributes)
        {
            try
            {
                DisposePipe();

                _pipe = new AFDataPipe();

                _attributes.Clear();

                // =====================================================
                // 1. FILTRAR ATRIBUTOS CON DATA REFERENCE
                // =====================================================

                var candidates =
                    new List<AFAttribute>();

                foreach (var attribute in attributes)
                {
                    if (attribute == null)
                    {
                        continue;
                    }

                    if (attribute.DataReference == null)
                    {
                        continue;
                    }

                    candidates.Add(attribute);
                }

                if (candidates.Count == 0)
                {
                    _logger.LogWarning(
                        "No hay atributos con DataReference para registrar en AFDataPipe.");

                    return false;
                }

                _logger.LogInformation(
                    "Registrando {Count} atributos en AFDataPipe...",
                    candidates.Count);

                // =====================================================
                // 2. REGISTRAR ATRIBUTOS
                // =====================================================

                AFListResults<AFAttribute, AFDataPipeEvent> result;

                try
                {
                    result =
                        _pipe.AddSignupsWithInitEvents(candidates);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error general registrando atributos en AFDataPipe.");

                    return false;
                }

                // =====================================================
                // 3. PROCESAR ERRORES INDIVIDUALES
                // =====================================================

                var errorAttributes =
                    new HashSet<AFAttribute>();

                if (result.HasErrors)
                {
                    foreach (var error in result.Errors)
                    {
                        errorAttributes.Add(error.Key);

                        _logger.LogWarning(
                            error.Value,
                            "⚠️ Atributo omitido de AFDataPipe: {Attribute}",
                            error.Key.Name);
                    }
                }

                // =====================================================
                // 4. DETERMINAR ATRIBUTOS REGISTRADOS
                // =====================================================

                foreach (var attribute in candidates)
                {
                    if (!errorAttributes.Contains(attribute))
                    {
                        _attributes.Add(attribute);
                    }
                }

                // =====================================================
                // 5. ESTADO FINAL
                // =====================================================

                var requestedCount =
                    candidates.Count;

                var registeredCount =
                    _attributes.Count;

                var omittedCount =
                    requestedCount - registeredCount;

                _logger.LogInformation(
                    "📊 AFDataPipe | Solicitados: {Requested} | Registrados: {Registered} | Omitidos: {Omitted}",
                    requestedCount,
                    registeredCount,
                    omittedCount);

                // =====================================================
                // 6. SI AL MENOS UNO FUNCIONA, EL PIPE FUNCIONA
                // =====================================================

                if (registeredCount > 0)
                {
                    _initialized = true;

                    if (omittedCount > 0)
                    {
                        _logger.LogWarning(
                            "⚠️ AFDataPipe inicializado parcialmente. " +
                            "Se omitieron {Omitted} atributos incompatibles.",
                            omittedCount);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "✅ AFDataPipe inicializado correctamente.");
                    }

                    return true;
                }

                // =====================================================
                // 7. NINGÚN ATRIBUTO PUDO REGISTRARSE
                // =====================================================

                _initialized = false;

                _logger.LogError(
                    "❌ Ningún atributo pudo registrarse en AFDataPipe.");

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error inicializando AFDataPipe.");

                _initialized = false;

                return false;
            }
        }

        /// <summary>
        /// Obtiene los eventos pendientes del AFDataPipe.
        ///
        /// El resultado contiene:
        /// - eventos iniciales generados por la suscripción;
        /// - cambios posteriores de los atributos registrados.
        /// </summary>
        public AFListResults<AFAttribute, AFDataPipeEvent> GetEvents()
        {
            if (!_initialized || _pipe == null)
            {
                return new AFListResults<AFAttribute, AFDataPipeEvent>();
            }

            try
            {
                return _pipe.GetUpdateEvents();
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error obteniendo eventos desde AFDataPipe.");

                return new AFListResults<AFAttribute, AFDataPipeEvent>();
            }
        }

        /// <summary>
        /// Obtiene solamente la lista de eventos.
        /// </summary>
        public IList<AFDataPipeEvent> GetEventResults()
        {
            var result = GetEvents();

            return result.Results;
        }

        /// <summary>
        /// Cantidad de atributos registrados actualmente.
        /// </summary>
        public int RegisteredCount
        {
            get
            {
                return _attributes.Count;
            }
        }

        /// <summary>
        /// Indica si el DataPipe está inicializado.
        /// </summary>
        public bool IsInitialized
        {
            get
            {
                return _initialized && _pipe != null;
            }
        }

        /// <summary>
        /// Libera el DataPipe actual.
        /// </summary>
        private void DisposePipe()
        {
            try
            {
                if (_pipe != null)
                {
                    _pipe.Dispose();
                    _pipe = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Error liberando AFDataPipe.");
            }

            _initialized = false;
        }

        /// <summary>
        /// Libera todos los recursos del servicio.
        /// </summary>
        public void Dispose()
        {
            DisposePipe();

            GC.SuppressFinalize(this);
        }
    }
}