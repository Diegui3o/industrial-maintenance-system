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
        /// </summary>
        public bool Initialize(
            IEnumerable<AFAttribute> attributes)
        {
            try
            {
                DisposePipe();

                _pipe = new AFDataPipe();

                _attributes.Clear();

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

                    _attributes.Add(attribute);
                }

                if (_attributes.Count == 0)
                {
                    _logger.LogWarning(
                        "No hay atributos con DataReference para registrar en AFDataPipe.");

                    return false;
                }

                var list =
                    new List<AFAttribute>(_attributes);

                _logger.LogInformation(
                    "Registrando {Count} atributos en AFDataPipe...",
                    list.Count);

                var result =
                    _pipe.AddSignupsWithInitEvents(list);

                if (result.HasErrors)
                {
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError(
                            error.Value,
                            "Error registrando atributo {Attribute}",
                            error.Key.Name);
                    }
                }

                _initialized =
                    !result.HasErrors;

                if (_initialized)
                {
                    _logger.LogInformation(
                        "AFDataPipe inicializado correctamente. " +
                        "Atributos registrados: {Count}",
                        _attributes.Count);
                }
                else
                {
                    _logger.LogWarning(
                        "AFDataPipe se inicializó con errores.");
                }

                return _initialized;
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