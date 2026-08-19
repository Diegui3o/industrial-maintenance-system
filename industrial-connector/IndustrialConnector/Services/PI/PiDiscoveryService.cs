using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using OSIsoft.AF;
using OSIsoft.AF.Asset;

namespace IndustrialConnector.Services.PI
{
    public class PiDiscoveryService
    {
        private readonly PiConnectionService _connection;
        private readonly PiDatabaseService _databaseService;
        private readonly ILogger<PiDiscoveryService> _logger;

        public PiDiscoveryService(
            PiConnectionService connection,
            PiDatabaseService databaseService,
            ILogger<PiDiscoveryService> logger)
        {
            _connection = connection;
            _databaseService = databaseService;
            _logger = logger;
        }

        /// <summary>
        /// Descubre todos los elementos debajo de una raíz.
        /// </summary>
        public List<AFElement> DiscoverElements(
            string databaseName,
            string rootElementName)
        {
            var elements = new List<AFElement>();

            if (!_connection.IsConnected)
            {
                _logger.LogWarning(
                    "⚠️ PI System no está conectado.");

                return elements;
            }

            try
            {
                var database =
                    _databaseService.GetDatabase(databaseName);

                if (database == null)
                {
                    return elements;
                }

                var root =
                    database.Elements[rootElementName];

                if (root == null)
                {
                    _logger.LogWarning(
                        "⚠️ Elemento raíz no encontrado: {Root}",
                        rootElementName);

                    return elements;
                }

                Traverse(root, elements);

                _logger.LogInformation(
                    "🔎 Discovery completado: {Count} elementos encontrados.",
                    elements.Count);

                return elements;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error durante discovery de PI.");

                return elements;
            }
        }

        /// <summary>
        /// Recorre recursivamente todo el árbol AF.
        /// </summary>
        private void Traverse(
            AFElement element,
            List<AFElement> elements)
        {
            elements.Add(element);

            foreach (AFElement child in element.Elements)
            {
                Traverse(child, elements);
            }
        }

        /// <summary>
        /// Obtiene todos los atributos de un elemento.
        /// </summary>
        public List<AFAttribute> GetAttributes(
            AFElement element)
        {
            var attributes = new List<AFAttribute>();

            if (element == null)
            {
                return attributes;
            }

            foreach (AFAttribute attribute in element.Attributes)
            {
                attributes.Add(attribute);
            }

            return attributes;
        }
    }
}