using System.Net;
using System.Text;
using System.Text.Json;
using IndustrialConnector.Services;

namespace IndustrialConnector.Services;

/// <summary>
/// Mini servidor HTTP para health checks.
/// Solo responde a GET /health.
/// No recibe datos. No modifica nada.
/// </summary>
public class HealthEndpoint
{
    private readonly HttpListener _listener;
    private readonly HealthService _health;

    public HealthEndpoint(HealthService health, int port = 5000)
    {
        _health = health;
        _listener = new HttpListener();
        _listener.Prefixes.Add($"http://+:{port}/health/");
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _listener.Start();
        
        while (!cancellationToken.IsCancellationRequested)
        {
            var context = await _listener.GetContextAsync();
            var response = context.Response;
            
            var json = JsonSerializer.Serialize(_health.GetStatus(), 
                new JsonSerializerOptions { WriteIndented = true });
            
            var buffer = Encoding.UTF8.GetBytes(json);
            response.ContentType = "application/json";
            response.ContentLength64 = buffer.Length;
            response.StatusCode = 200;
            
            await response.OutputStream.WriteAsync(buffer, cancellationToken);
            response.OutputStream.Close();
        }
    }
}