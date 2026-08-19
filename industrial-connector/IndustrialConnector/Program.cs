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
            // SERVICIOS PI
            // ============================================

            builder.Services.AddSingleton<PiConnectionService>();

            builder.Services.AddSingleton<PiDatabaseService>();

            builder.Services.AddSingleton<PiDiscoveryService>();

            builder.Services.AddSingleton<PiAttributeDiscoveryService>();

            builder.Services.AddSingleton<PiAttributeClassifierService>();

            builder.Services.AddSingleton<PiAttributeReaderService>();


            // ============================================
            // SERVICIOS GENERALES
            // ============================================

            builder.Services.AddSingleton<BufferService>(
                sp => new BufferService(10000));

            builder.Services.AddSingleton<HealthService>();


            // ============================================
            // HTTP CLIENT - BACKEND GO
            // ============================================

            builder.Services.AddHttpClient<ExporterService>(client =>
            {
                var config =
                    builder.Configuration
                        .GetSection("GoBackend")
                        .Get<GoBackendConfig>();

                client.BaseAddress = new Uri(
                    config?.BaseUrl
                    ?? "http://10.30.37.165:1883");

                client.Timeout = TimeSpan.FromSeconds(30);

                client.DefaultRequestHeaders.Add(
                    "Accept",
                    "application/json");
            });


            // ============================================
            // WORKERS
            // ============================================

            builder.Services.AddHostedService<PiSystemWorker>();

            builder.Services.AddHostedService<BatchSenderWorker>();


            // ============================================
            // LOGGING - SERILOG
            // ============================================

            builder.Logging.ClearProviders();

            builder.Logging.AddSerilog(
                new LoggerConfiguration()
                    .WriteTo.Console()
                    .WriteTo.File(
                        "logs/connector-.log",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 7)
                    .MinimumLevel.Information()
                    .CreateLogger());


            // ============================================
            // WINDOWS SERVICE
            // ============================================

            builder.Services.AddWindowsService();


            // ============================================
            // CREAR HOST
            // ============================================

            var host = builder.Build();


            // ============================================
            // INFORMACIÓN DE INICIO
            // ============================================

            Log.Information(
                "🚀 Iniciando Industrial Connector");

            var piConfig =
                builder.Configuration
                    .GetSection("PiSystem")
                    .Get<PiSystemConfig>();

            var goConfig =
                builder.Configuration
                    .GetSection("GoBackend")
                    .Get<GoBackendConfig>();

            Log.Information(
                "📡 Backend: {BaseUrl}",
                goConfig?.BaseUrl);

            Log.Information(
                "🔌 PI Server: {Server}",
                piConfig?.Server);


            // ============================================
            // INICIAR APLICACIÓN
            // ============================================

            await host.RunAsync();
        }
    }
}