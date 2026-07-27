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
    }
}