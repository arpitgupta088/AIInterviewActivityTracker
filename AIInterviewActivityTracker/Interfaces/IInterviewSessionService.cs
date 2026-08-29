using AIInterviewActivityTracker.DTOs.InterviewSession;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Interview Session business logic operations.
    /// </summary>
    public interface IInterviewSessionService
    {
        /// <summary>
        /// Creates a new interview tracking session.
        /// </summary>
        Task<InterviewSessionResponse> CreateSessionAsync(
            CreateInterviewSessionRequest request);

        /// <summary>
        /// Retrieves an interview session by its unique SessionId.
        /// </summary>
        Task<InterviewSessionResponse?> GetSessionByIdAsync(
            string sessionId);

        /// <summary>
        /// Updates the lifecycle status of an interview session.
        /// </summary>
        Task<bool> UpdateSessionStatusAsync(
            UpdateInterviewSessionRequest request);

        /// <summary>
        /// Returns the total number of interview sessions.
        /// </summary>
        Task<long> GetTotalSessionCountAsync();

        /// <summary>
        /// Returns the number of sessions matching the supplied status.
        /// </summary>
        Task<long> GetSessionCountByStatusAsync(string status);

        /// <summary>
        /// Retrieves interview sessions using server-side pagination.
        ///
        /// Input:
        /// - page: The page number to retrieve. Page numbering starts from 1.
        /// - pageSize: The maximum number of interview sessions to retrieve
        ///   for the requested page.
        ///
        /// Output:
        /// - Returns a tuple containing:
        ///   - Sessions: The interview session responses for the requested page.
        ///   - TotalCount: The total number of interview sessions available
        ///     before pagination is applied.
        /// </summary>
        Task<(IEnumerable<InterviewSessionResponse> Sessions, long TotalCount)> 
            GetAllSessionsAsync(int page, int pageSize);
    }
}