using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using IndustrialConnector.Models;
using IndustrialConnector.Services;
using IndustrialConnector.Workers;
using Serilog;
using Microsoft.Extensions.Logging;
using IndustrialConnector.Services.PI;

namespace IndustrialConnector
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var builder = Host.CreateApplicationBuilder(args);

            // ============================================
            // CONFIGURACIÓN
            // ============================================
            builder.Services.Configure<PiSystemConfig>(
                builder.Configuration.GetSection("PiSystem"));
            builder.Services.Configure<GoBackendConfig>(
                builder.Configuration.GetSection("GoBackend"));

            // ============================================
            // SERVICIOS
            // ============================================
            builder.Services.AddSingleton<PiConnectionService>();
            builder.Services.AddSingleton<PiDatabaseService>();
            builder.Services.AddSingleton<PiDiscoveryService>();

            builder.Services.AddSingleton<PiSystemService>();
            builder.Services.AddSingleton<BufferService>(sp => new BufferService(10000));
            builder.Services.AddSingleton<HealthService>();

            // HttpClient para el backend Go
            builder.Services.AddHttpClient<ExporterService>(client =>
            {
                var config = builder.Configuration.GetSection("GoBackend").Get<GoBackendConfig>();
                client.BaseAddress = new Uri(config?.BaseUrl ?? "http://10.30.37.165:1883");
                client.Timeout = TimeSpan.FromSeconds(30);
                client.DefaultRequestHeaders.Add("Accept", "application/json");
            });

            // ============================================
            // WORKERS
            // ============================================
            builder.Services.AddHostedService<PiSystemWorker>();
            builder.Services.AddHostedService<BatchSenderWorker>();

            // ============================================
            // LOGGING (usando Serilog)
            // ============================================
            builder.Logging.ClearProviders();
            builder.Logging.AddSerilog(new LoggerConfiguration()
                .WriteTo.Console()
                .WriteTo.File("logs/connector-.log",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 7)
                .MinimumLevel.Information()
                .CreateLogger());

            // ============================================
            // WINDOWS SERVICE
            // ============================================
            builder.Services.AddWindowsService();

            var host = builder.Build();

            // =========================================================
            // PRUEBA TEMPORAL - PI DISCOVERY
            // =========================================================

            using (var scope = host.Services.CreateScope())
            {
                var discovery = scope.ServiceProvider
                    .GetRequiredService<IndustrialConnector.Services.PI.PiDiscoveryService>();

                var connection = scope.ServiceProvider
                    .GetRequiredService<IndustrialConnector.Services.PI.PiConnectionService>();

                var config = scope.ServiceProvider
                    .GetRequiredService<Microsoft.Extensions.Options.IOptions<IndustrialConnector.Models.PiSystemConfig>>()
                    .Value;

                if (!connection.IsConnected)
                {
                    connection.Connect();
                }

                var elements = discovery.DiscoverElements(
                    config.Database,
                    config.RootElement);

                Console.WriteLine("");
                Console.WriteLine("==========================================");
                Console.WriteLine(" PI DISCOVERY TEST");
                Console.WriteLine("==========================================");
                Console.WriteLine($"Elementos encontrados: {elements.Count}");

                foreach (var element in elements)
                {
                    if (element.Name.Contains("SE138"))
                    {
                        Console.WriteLine("");
                        Console.WriteLine($"ELEMENTO: {element.Name}");
                        Console.WriteLine($"RUTA: {element.GetPath()}");

                        var attributes = discovery.GetAttributes(element);

                        Console.WriteLine($"ATRIBUTOS: {attributes.Count}");

                        foreach (var attribute in attributes)
                        {
                            Console.WriteLine($"  - {attribute.Name}");
                        }
                    }
                }

                Console.WriteLine("==========================================");
                Console.WriteLine("");
            }
            // ============================================
            // INICIAR
            // ============================================
            Log.Information("🚀 Iniciando Industrial Connector");
            var piConfig = builder.Configuration.GetSection("PiSystem").Get<PiSystemConfig>();
            var goConfig = builder.Configuration.GetSection("GoBackend").Get<GoBackendConfig>();
            Log.Information("📡 Backend: {BaseUrl}", goConfig?.BaseUrl);
            Log.Information("🔌 PI Server: {Server}", piConfig?.Server);

            await host.RunAsync();
        }
    }
}