using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using Microsoft.Extensions.Logging;

namespace AIInterviewActivityTracker.Services
{
    /// <summary>
    /// Generates an aggregated activity summary for an interview session.
    ///
    /// Input:
    /// sessionId - Unique identifier of the interview session.
    ///
    /// Output:
    /// Returns the generated interview summary, or null when the session
    /// cannot be found or the session identifier is invalid.
    /// </summary>
    public class InterviewSummaryGenerator : IInterviewSummaryGenerator
    {
        private readonly IActivityEventRepository _eventRepository;
        private readonly IInterviewSummaryRepository _summaryRepository;
        private readonly IInterviewSessionRepository _sessionRepository;
        private readonly ILogger<InterviewSummaryGenerator> _logger;

        public InterviewSummaryGenerator(
            IActivityEventRepository eventRepository,
            IInterviewSummaryRepository summaryRepository,
            IInterviewSessionRepository sessionRepository,
            ILogger<InterviewSummaryGenerator> logger)
        {
            ArgumentNullException.ThrowIfNull(eventRepository);
            ArgumentNullException.ThrowIfNull(summaryRepository);
            ArgumentNullException.ThrowIfNull(sessionRepository);
            ArgumentNullException.ThrowIfNull(logger);

            _eventRepository = eventRepository;
            _summaryRepository = summaryRepository;
            _sessionRepository = sessionRepository;
            _logger = logger;
        }

        /// <summary>
        /// Generates a session activity summary for the specified session.
        /// Returns the existing summary if one has already been generated.
        /// </summary>
        public async Task<InterviewSummary?> GenerateSummaryAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId)) return null;

            var normalizedSessionId = sessionId.Trim();

            // Verify if a summary already exists to prevent duplicate generation
            var existingSummary = await _summaryRepository.GetSummaryBySessionIdAsync(normalizedSessionId);
            if (existingSummary != null)
            {
                _logger.LogInformation("Summary already exists for session {SessionId}.", normalizedSessionId);
                return existingSummary;
            }

            // Retrieve session details to extract candidate information
            var session = await _sessionRepository.GetSessionByIdAsync(normalizedSessionId);
            if (session == null)
            {
                _logger.LogWarning("Session {SessionId} not found. Cannot generate summary.", normalizedSessionId);
                return null;
            }

            // Fetch all activity events associated with this session
            var events = await _eventRepository.GetEventsBySessionIdAsync(normalizedSessionId);

            // Compute aggregate metrics: total events, error occurrences, and candidate behavioral flags
            int totalEventsCount = events?.Count ?? 0;

            int errorEventsCount = events?.Count(e =>
                e.EventType.Contains("ERROR", StringComparison.OrdinalIgnoreCase) ||
                e.EventType.Contains("FAIL", StringComparison.OrdinalIgnoreCase)) ?? 0;

            bool isAbortedByCandidate = events?.Any(e =>
                e.EventType.Equals("BEACON_UNLOAD", StringComparison.OrdinalIgnoreCase) ||
                e.EventType.Equals("TAB_HIDDEN", StringComparison.OrdinalIgnoreCase)) ?? false;

            DateTime lastActiveTimestamp = (events != null && events.Any())
                ? events.Max(e => e.Timestamp)
                : (session.UpdatedAt ?? session.CreatedAt);

            // Generate contextual summary notes based on computed metrics
            string notes = errorEventsCount > 0
                ? $"Action Required: {errorEventsCount} error(s) detected."
                : "Session processed successfully.";

            // Construct the final summary object
            var newSummary = new InterviewSummary
            {
                SessionId = session.SessionId,
                CandidateId = session.CandidateId,
                TotalEventsCount = totalEventsCount,
                ErrorEventsCount = errorEventsCount,
                IsAbortedByCandidate = isAbortedByCandidate,
                LastActiveTimestamp = lastActiveTimestamp,
                SummaryNotes = notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Persist the generated summary to the database
            await _summaryRepository.CreateSummaryAsync(newSummary);
            _logger.LogInformation("Generated and saved new summary for session {SessionId}.", normalizedSessionId);

            return newSummary;
        }
    }
}