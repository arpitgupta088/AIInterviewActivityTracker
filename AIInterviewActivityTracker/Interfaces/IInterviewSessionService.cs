using AIInterviewActivityTracker.DTOs.InterviewSession;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Interview Session business logic operations.
    /// </summary>
    public interface IInterviewSessionService
    {
        Task<InterviewSessionResponse> CreateSessionAsync(CreateInterviewSessionRequest request);

        Task<InterviewSessionResponse?> GetSessionByIdAsync(string sessionId);

        Task<bool> UpdateSessionStatusAsync(UpdateInterviewSessionRequest request);
    }
}