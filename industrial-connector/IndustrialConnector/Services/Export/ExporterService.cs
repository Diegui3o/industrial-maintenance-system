using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace IndustrialConnector.Services
{
    public class ExporterService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ExporterService> _logger;

        public ExporterService(HttpClient httpClient, ILogger<ExporterService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<bool> SendDataAsync(
            string jsonData,
            string apiKey,
            string endpoint)
        {
            try
            {
                var content = new StringContent(
                    jsonData,
                    Encoding.UTF8,
                    "application/json"
                );

                _httpClient.DefaultRequestHeaders.Clear();

                _httpClient.DefaultRequestHeaders.Add(
                    "X-API-Key",
                    apiKey
                );

                _httpClient.DefaultRequestHeaders.Add(
                    "Accept",
                    "application/json"
                );

                var response = await _httpClient.PostAsync(
                    endpoint,
                    content
                );

                if (response.IsSuccessStatusCode)
                {
                    var responseBody =
                        await response.Content.ReadAsStringAsync();

                    _logger.LogTrace(
                        "✅ Respuesta: {Response}",
                        responseBody
                    );

                    return true;
                }

                var errorBody =
                    await response.Content.ReadAsStringAsync();

                _logger.LogError(
                    "❌ Error HTTP {StatusCode}: {Error}",
                    response.StatusCode,
                    errorBody
                );

                return false;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error de red al enviar datos"
                );

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "❌ Error inesperado en SendDataAsync"
                );

                return false;
            }
        }
    }
}