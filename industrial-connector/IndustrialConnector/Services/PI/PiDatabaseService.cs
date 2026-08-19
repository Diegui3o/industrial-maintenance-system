using System;
using Microsoft.Extensions.Logging;
using OSIsoft.AF;

namespace IndustrialConnector.Services.PI
{
    public class PiDatabaseService
    {
        private readonly PiConnectionService _connection;
        private readonly ILogger<PiDatabaseService> _logger;

        public PiDatabaseService(
            PiConnectionService connection,
            ILogger<PiDatabaseService> logger)
        {
            _connection = connection;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene una base de datos AF por nombre.
        /// </summary>
        public AFDatabase? GetDatabase(string databaseName)
        {
            if (!_connection.IsConnected)
            {
                _logger.LogError(
                    "❌ No se puede obtener la base de datos porque PI System no está conectado.");

                return null;
            }

            try
            {
                PISystem piSystem = _connection.GetPiSystem();

                AFDatabase? database = piSystem.Databases[databaseName];

                if (database == null)
                {
                    _logger.LogWarning(
                        "⚠️ AF Database no encontrada: {Database}",
                        databaseName);

                    return null;
                }

                _logger.LogInformation(
                    "✅ AF Database seleccionada: {Database}",
                    database.Name);

                return database;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error obteniendo AF Database: {Database}",
                    databaseName);

                return null;
            }
        }
    }
}