using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
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

                var root = database.Elements[rootElementName];

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
                    "❌ Error realizando discovery de PI System.");

                return elements;
            }
        }

        public AFElement? FindElement(
            string databaseName,
            string rootElementName,
            string elementName)
        {
            var elements = DiscoverElements(
                databaseName,
                rootElementName);

            foreach (var element in elements)
            {
                if (string.Equals(
                    element.Name,
                    elementName,
                    StringComparison.OrdinalIgnoreCase))
                {
                    return element;
                }
            }

            return null;
        }

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

            _logger.LogDebug(
                "📋 Elemento {Element} tiene {Count} atributos.",
                element.Name,
                attributes.Count);

            return attributes;
        }

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
    }
}