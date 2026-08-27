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

        /// <summary>
        /// Creates and persists a new interview tracking session.
        ///
        /// Input:
        /// request - Session creation data containing SessionId, CandidateId,
        /// and InterviewId.
        ///
        /// Output:
        /// Returns the created interview session response.
        /// </summary>
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

        /// <summary>
        /// Retrieves an interview session by its unique SessionId.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns the matching session response, or null when the session
        /// does not exist.
        /// </summary>
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

        /// <summary>
        /// Updates the lifecycle status of an interview session.
        ///
        /// Input:
        /// request - Session update request containing SessionId and new status.
        ///
        /// Output:
        /// Returns true when the repository successfully updates the session;
        /// otherwise returns false.
        /// </summary>
        public async Task<bool> UpdateSessionStatusAsync(UpdateInterviewSessionRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            return await _sessionRepository.UpdateSessionStatusAsync(
                request.SessionId.Trim(),
                request.Status.Trim());
        }

        /// <summary>
        /// Returns the total number of interview sessions.
        /// </summary>
        public async Task<long> GetTotalSessionCountAsync()
        {
            return await _sessionRepository.GetTotalSessionCountAsync();
        }

        /// <summary>
        /// Returns the number of interview sessions matching the supplied status.
        /// </summary>
        public async Task<long> GetSessionCountByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException(
                    "Status cannot be null or whitespace.",
                    nameof(status));
            }

            return await _sessionRepository.GetSessionCountByStatusAsync(
                status.Trim());
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

        /// <summary>
        /// Retrieves all interview sessions ordered by start time descending.
        /// </summary>
        public async Task<IEnumerable<InterviewSessionResponse>> GetAllSessionsAsync()
        {
            var sessions = await _sessionRepository.GetInterviewSessionsAsync();

            return sessions.Select(session => new InterviewSessionResponse
            {
                SessionId = session.SessionId,
                CandidateId = session.CandidateId,
                InterviewId = session.InterviewId,
                Status = session.Status,
                StartTime = session.StartTime,
                EndTime = session.EndTime
            });
        }
    }
}