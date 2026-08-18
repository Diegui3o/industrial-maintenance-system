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
builder.Services.AddSingleton<PiSystemService>();
builder.Services.AddSingleton<BufferService>();
builder.Services.AddSingleton<HealthService>();

// Solo HttpClient para el backend Go
builder.Services.AddHttpClient<ExporterService>(client =>
{
    var config = builder.Configuration.GetSection("GoBackend").Get<GoBackendConfig>();
    client.BaseAddress = new Uri(config?.BaseUrl ?? "http://10.30.37.165:1883");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// Configurar HttpClient para el backend Go
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
// LOGGING
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

// ============================================
// INICIAR
// ============================================
Log.Information("🚀 Iniciando Industrial Connector");
var piConfig = builder.Configuration.GetSection("PiSystem").Get<PiSystemConfig>();
var goConfig = builder.Configuration.GetSection("GoBackend").Get<GoBackendConfig>();
Log.Information("📡 Backend: {BaseUrl}", goConfig?.BaseUrl);
Log.Information("🔌 PI Web API: {ServerUrl}", piConfig?.ServerUrl);

await host.RunAsync();