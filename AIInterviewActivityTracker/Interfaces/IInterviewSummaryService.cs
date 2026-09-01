using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Interview Summary business logic operations.
    /// </summary>
    public interface IInterviewSummaryService
    {
        /// <summary>
        /// Creates and persists a generated interview summary.
        /// </summary>
        Task<InterviewSummary> CreateSummaryAsync(
            InterviewSummary summary);

        /// <summary>
        /// Retrieves an interview summary by SessionId.
        /// </summary>
        Task<InterviewSummary?> GetSummaryBySessionIdAsync(
            string sessionId);

        /// <summary>
        /// Updates an existing interview summary.
        /// </summary>
        Task<bool> UpdateSummaryAsync(
            InterviewSummary summary);

        /// <summary>
        /// Determines whether a summary already exists.
        /// </summary>
        Task<bool> SummaryExistsAsync(
            string sessionId);

        /// <summary>
        /// Returns the total number of generated interview summaries.
        /// </summary>
        Task<long> GetTotalSummaryCountAsync();
    }
}