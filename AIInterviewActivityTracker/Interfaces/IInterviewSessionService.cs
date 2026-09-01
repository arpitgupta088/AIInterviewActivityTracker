using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Interview Session business logic operations.
    /// </summary>
    public interface IInterviewSessionService
    {
        /// <summary>
        /// Creates a new interview tracking session.
        ///
        /// Input:
        /// - sessionId: Unique interview session identifier.
        /// - candidateId: Candidate identifier.
        /// - interviewId: Interview identifier.
        ///
        /// Output:
        /// - Returns the created interview session.
        /// </summary>
        Task<InterviewSession> CreateSessionAsync(
           string sessionId,
           string candidateId,
           string interviewId);

        /// <summary>
        /// Retrieves an interview session by its unique SessionId.
        /// </summary>
        Task<InterviewSession?> GetSessionByIdAsync(
            string sessionId);

        /// <summary>
        /// Updates the lifecycle status of an interview session.
        /// </summary>
        Task<bool> UpdateSessionStatusAsync(
            string sessionId, string status);

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
        ///   - Sessions: The interview sessions for the requested page.
        ///   - TotalCount: The total number of interview sessions available
        ///     before pagination is applied.
        /// </summary>
        Task<(IEnumerable<InterviewSession> Sessions, long TotalCount)> 
            GetAllSessionsAsync(int page, int pageSize);
    }
}