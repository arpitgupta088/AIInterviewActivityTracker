using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for generating interview session summaries from raw events.
    /// </summary>
    public interface IInterviewSummaryGenerator
    {
        /// <summary>
        /// Analyzes events, generates a summary, saves it if it doesn't exist, and returns it.
        /// </summary>
        Task<InterviewSummary?> GenerateSummaryAsync(string sessionId);
    }
}