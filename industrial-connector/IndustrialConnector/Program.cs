using IndustrialConnector.Models;
using IndustrialConnector.Services;
using IndustrialConnector.Workers;
using Serilog;

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
builder.Services.AddSingleton<HealthService>();
builder.Services.AddSingleton<BufferService>(sp =>
    new BufferService(maxSize: 10000));
builder.Services.AddSingleton<PiSystemService>();

builder.Services.AddHttpClient<ExporterService>(client =>
{
    var config = builder.Configuration.GetSection("GoBackend").Get<GoBackendConfig>();
    client.BaseAddress = new Uri(config?.BaseUrl ?? "http://10.30.33:1880");
    client.Timeout = TimeSpan.FromSeconds(10);
});

// ============================================
// WORKERS
// ============================================
builder.Services.AddHostedService<PiSystemWorker>();
builder.Services.AddHostedService<BatchSenderWorker>();

// ============================================
// LOGGING
// ============================================
builder.Logging.ClearProviders();
builder.Logging.AddSerilog(new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/connector-.log", rollingInterval: RollingInterval.Day)
    .MinimumLevel.Information()
    .CreateLogger());

// ============================================
// WINDOWS SERVICE
// ============================================
builder.Services.AddWindowsService();

var host = builder.Build();

// ============================================
// HEALTH ENDPOINT (background)
// ============================================
var health = host.Services.GetRequiredService<HealthService>();
var healthEndpoint = new HealthEndpoint(health, 5000);
_ = healthEndpoint.StartAsync(CancellationToken.None);

await host.RunAsync();