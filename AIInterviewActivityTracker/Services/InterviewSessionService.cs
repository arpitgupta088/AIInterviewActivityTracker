using AIInterviewActivityTracker.DTOs.InterviewSession;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Constants;

namespace AIInterviewActivityTracker.Services
{
    /// <summary>
    /// Business logic service for managing candidate interview sessions.
    /// Injects IInterviewSessionRepository via Dependency Injection.
    /// </summary>
    public class InterviewSessionService : IInterviewSessionService
    {
        private readonly IInterviewSessionRepository _sessionRepository;

        public InterviewSessionService(IInterviewSessionRepository sessionRepository)
        {
            ArgumentNullException.ThrowIfNull(sessionRepository);
            _sessionRepository = sessionRepository;
        }
        
        public async Task<InterviewSessionResponse> CreateSessionAsync(CreateInterviewSessionRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            var sessionModel = new InterviewSession
            {
                SessionId = request.SessionId.Trim(),
                CandidateId = request.CandidateId.Trim(),
                InterviewId = request.InterviewId.Trim(),
                StartTime = DateTime.UtcNow,
                Status = SystemConstants.SessionStatus.InProgress,
                CreatedAt = DateTime.UtcNow
            };

            var createdSession = await _sessionRepository.CreateSessionAsync(sessionModel);

            if (createdSession == null)
            {
                throw new InvalidOperationException("Failed to persist the interview session in MongoDB.");
            }

            return MapToResponse(createdSession);
        }

        public async Task<InterviewSessionResponse?> GetSessionByIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            var session = await _sessionRepository.GetSessionByIdAsync(sessionId.Trim());

            if (session == null)
            {
                return null;
            }

            return MapToResponse(session);
        }

        public async Task<bool> UpdateSessionStatusAsync(UpdateInterviewSessionRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            return await _sessionRepository.UpdateSessionStatusAsync(
                request.SessionId.Trim(),
                request.Status.Trim());
        }

        private static InterviewSessionResponse MapToResponse(InterviewSession model)
        {
            return new InterviewSessionResponse
            {
                Id = model.Id ?? string.Empty,
                SessionId = model.SessionId,
                CandidateId = model.CandidateId,
                InterviewId = model.InterviewId,
                StartTime = model.StartTime,
                EndTime = model.EndTime,
                Status = model.Status,
                CreatedAt = model.CreatedAt
            };
        }
    }
}