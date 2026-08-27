using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for MongoDB InterviewSession database operations.
    /// </summary>
    public interface IInterviewSessionRepository
    {
        /// <summary>
        /// Creates and persists a new interview session.
        /// </summary>
        Task<InterviewSession> CreateSessionAsync(InterviewSession session);

        /// <summary>
        /// Retrieves an interview session by its unique SessionId.
        /// </summary>
        Task<InterviewSession?> GetSessionByIdAsync(string sessionId);

        /// <summary>
        /// Updates the status of an existing interview session.
        /// </summary>
        Task<bool> UpdateSessionStatusAsync(string sessionId, string status);

        /// <summary>
        /// Returns the total number of interview sessions.
        /// </summary>
        Task<long> GetTotalSessionCountAsync();

        /// <summary>
        /// Returns the number of sessions matching the supplied status.
        /// </summary>
        Task<long> GetSessionCountByStatusAsync(string status);

        /// <summary>
        /// Retrieves all completed interview sessions.
        /// </summary>
        Task<List<InterviewSession>> GetCompletedSessionsAsync();

        /// <summary>
        /// Retrives all sessions
        /// </summary>
        Task<IEnumerable<InterviewSession>> GetInterviewSessionsAsync();
    }
}