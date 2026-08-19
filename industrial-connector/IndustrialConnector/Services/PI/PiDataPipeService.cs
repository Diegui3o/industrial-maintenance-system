using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using OSIsoft.AF.Asset;
using OSIsoft.AF.Data;

namespace IndustrialConnector.Services.PI
{
    /// <summary>
    /// Administra el AFDataPipe utilizado para recibir
    /// cambios de atributos PI.
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
        /// Registra los atributos en el DataPipe.
        /// </summary>
        public bool Initialize(
            IEnumerable<AFAttribute> attributes)
        {
            try
            {
                DisposePipe();

                _pipe =
                    new AFDataPipe();

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
                        "⚠️ No hay atributos para registrar en DataPipe.");

                    return false;
                }

                var list =
                    new List<AFAttribute>(
                        _attributes);

                _logger.LogInformation(
                    "🔌 Registrando {Count} atributos en AFDataPipe...",
                    list.Count);

                var result =
                    _pipe.AddSignupsWithInitEvents(
                        list);

                if (result.HasErrors)
                {
                    foreach (var error in result.Errors)
                    {
                        _logger.LogError(
                            error.Value,
                            "❌ Error registrando atributo {Attribute}",
                            error.Key.Name);
                    }
                }

                _initialized = true;

                _logger.LogInformation(
                    "✅ AFDataPipe activo. Atributos registrados: {Count}",
                    _attributes.Count);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error inicializando AFDataPipe.");

                _initialized = false;

                return false;
            }
        }

        /// <summary>
        /// Obtiene los eventos pendientes del DataPipe.
        /// </summary>
        public List<AFDataPipeEvent> GetEvents()
        {
            var events =
                new List<AFDataPipeEvent>();

            if (!_initialized ||
                _pipe == null)
            {
                return events;
            }

            try
            {
                bool hasMoreEvents = true;

                while (hasMoreEvents)
                {
                    var result =
                        _pipe.GetUpdateEvents(
                            out hasMoreEvents);

                    if (result == null)
                    {
                        break;
                    }

                    foreach (var dataPipeEvent
                             in result.Results)
                    {
                        if (dataPipeEvent != null)
                        {
                            events.Add(
                                dataPipeEvent);
                        }
                    }

                    if (result.HasErrors)
                    {
                        foreach (var error
                                 in result.Errors)
                        {
                            _logger.LogWarning(
                                error.Value,
                                "⚠️ Error obteniendo evento de {Attribute}",
                                error.Key.Name);
                        }
                    }
                }

                return events;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error obteniendo eventos de AFDataPipe.");

                return events;
            }
        }

        public int SignupCount =>
            _attributes.Count;

        public void Dispose()
        {
            DisposePipe();

            GC.SuppressFinalize(this);
        }

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
                    "⚠️ Error liberando AFDataPipe.");
            }

            _initialized = false;
        }
    }
}