using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Models;

namespace IndustrialConnector.Services.PI
{
    public class TagsConfigService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<TagsConfigService> _logger;

        public TagsConfigService(HttpClient httpClient, ILogger<TagsConfigService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<List<TagConfig>> ObtenerTagsParaMonitorearAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/api/pi/tags/para-monitorear");
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var dtos = JsonSerializer.Deserialize<List<TagParaMonitorearDto>>(json);

                var tags = new List<TagConfig>();
                foreach (var dto in dtos ?? new List<TagParaMonitorearDto>())
                {
                    tags.Add(new TagConfig
                    {
                        EquipmentId = dto.EquipoId,
                        ElementPath = dto.ElementPath,
                        AttributeName = dto.TagName,
                        DisplayName = $"{dto.EquipoNombre} - {dto.Parametro}",
                        Unit = dto.Unidad
                    });
                }

                _logger.LogInformation(
                    "Tags a monitorear obtenidos del backend: {Count}", tags.Count);

                return tags;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error obteniendo tags desde el backend. Se usa lista vacía.");
                return new List<TagConfig>();
            }
        }
    }
}