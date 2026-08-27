using AIInterviewActivityTracker.Interfaces;

namespace AIInterviewActivityTracker.BackgroundServices
{
    /// <summary>
    /// Periodically generates interview summaries for completed sessions.
    /// </summary>
    public class InterviewSummaryBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InterviewSummaryBackgroundService> _logger;

        public InterviewSummaryBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<InterviewSummaryBackgroundService> logger)
        {
            ArgumentNullException.ThrowIfNull(serviceProvider);
            ArgumentNullException.ThrowIfNull(logger);

            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Interview Summary Background Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();

                    var sessionRepository =
                        scope.ServiceProvider
                            .GetRequiredService<IInterviewSessionRepository>();

                    var summaryGenerator =
                        scope.ServiceProvider
                            .GetRequiredService<IInterviewSummaryGenerator>();

                    var completedSessions =
                        await sessionRepository.GetCompletedSessionsAsync();

                    foreach (var session in completedSessions)
                    {
                        if (stoppingToken.IsCancellationRequested)
                        {
                            break;
                        }

                        try
                        {
                            await summaryGenerator.GenerateSummaryAsync(session.SessionId);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(
                            ex,
                            "Failed to generate summary for session {SessionId}",
                            session.SessionId);
                        }

                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "An error occurred while generating interview summaries.");
                }

                await Task.Delay(
                    TimeSpan.FromMinutes(1),
                    stoppingToken);
            }

            _logger.LogInformation(
                "Interview Summary Background Service stopped.");
        }
    }
}