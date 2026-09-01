using AIInterviewActivityTracker.BackgroundServices;
using AIInterviewActivityTracker.Configurations;
using AIInterviewActivityTracker.Repositories;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Middleware;
using AIInterviewActivityTracker.Repositories;
using AIInterviewActivityTracker.Services;
using AIInterviewActivityTracker.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Framework Services
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateInterviewSessionRequestValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuration with Eager Validation (Fail-Fast)
builder.Services
    .AddOptions<MongoDbSettings>()
    .Bind(builder.Configuration.GetSection("MongoDbSettings"))
    .Validate(settings =>
        !string.IsNullOrWhiteSpace(settings.ConnectionString) &&
        !string.IsNullOrWhiteSpace(settings.DatabaseName) &&
        !string.IsNullOrWhiteSpace(settings.InterviewSessionCollection) &&
        !string.IsNullOrWhiteSpace(settings.ActivityEventsCollection) &&
        !string.IsNullOrWhiteSpace(settings.InterviewSummaryCollection) &&
        !string.IsNullOrWhiteSpace(settings.SessionRecordingCollection),
        "MongoDbSettings configuration is invalid.")
    .ValidateOnStart();

// MongoDB
builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var connectionString = builder.Configuration["MongoDbSettings:ConnectionString"];

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "MongoDB ConnectionString is missing in appsettings.json.");
    }

    return new MongoClient(connectionString);
});

builder.Services.AddSingleton<MongoDbContext>();

// Repository Registration
builder.Services.AddScoped<IInterviewSessionRepository, InterviewSessionRepository>();
builder.Services.AddScoped<IActivityEventRepository, ActivityEventRepository>();
builder.Services.AddScoped<IInterviewSummaryRepository, InterviewSummaryRepository>();
builder.Services.AddScoped<IRecordingRepository, RecordingRepository>();
builder.Services.AddScoped<ISessionRecordingRepository, SessionRecordingRepository>();

// Service Registration
builder.Services.AddScoped<IInterviewSessionService, InterviewSessionService>();
builder.Services.AddScoped<IActivityEventService, ActivityEventService>();
builder.Services.AddScoped<IInterviewSummaryService, InterviewSummaryService>();
builder.Services.AddScoped<IRecordingService, RecordingService>();
builder.Services.AddScoped<ISessionRecordingService, SessionRecordingService>();

//Generator Registration
builder.Services.AddScoped<IInterviewSummaryGenerator, InterviewSummaryGenerator>();

// Background Service Registration
builder.Services.AddHostedService<InterviewSummaryBackgroundService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

await MongoDbIndexes.CreateIndexesAsync(app.Services);

// HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "AI Interview Activity Tracker API v1");
    });
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();