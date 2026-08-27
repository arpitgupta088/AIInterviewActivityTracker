using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for MongoDB Interview Summary databse operations.
    /// </summary>
    public interface IInterviewSummaryRepository
    {
        /// <summary>
        /// Creates and persists a generated interview sumary
        /// </summary>
        Task<InterviewSummary> CreateSummaryAsync(InterviewSummary summary);

        /// <summary>
        /// Retrieves a generated interview summary by SessionId.
        /// </summary>
        Task<InterviewSummary?> GetSummaryBySessionIdAsync(string sessionId);

        /// <summary>
        /// Updates an existing interview summary.
        /// </summary>
        Task<bool> UpdateSummaryAsync(InterviewSummary summary);

        /// <summary>
        /// Determines whether a summary already exists for a session.
        /// </summary>
        Task<bool> SummaryExistsAsync(string sessionId);

        /// <summary>
        /// Returns the total number of generated interview summaries.
        /// </summary>
        Task<long> GetTotalSummaryCountAsync();
    }
}