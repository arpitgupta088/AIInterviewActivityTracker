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
        /// - sessionId: Unique interview session identifier.
        /// - candidateId: Candidate identifier.
        /// - interviewId: Interview identifier.
        ///
        /// Output:
        /// Returns the created interview session.
        /// </summary>
        public async Task<InterviewSession> CreateSessionAsync(string sessionId, string candidateId, string interviewId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                throw new ArgumentException(
                    "Session ID cannot be null or whitespace.",
                    nameof(sessionId));
            }

            if (string.IsNullOrWhiteSpace(candidateId))
            {
                throw new ArgumentException(
                    "Candidate ID cannot be null or whitespace.",
                    nameof(candidateId));
            }

            if (string.IsNullOrWhiteSpace(interviewId))
            {
                throw new ArgumentException(
                    "Interview ID cannot be null or whitespace.",
                    nameof(interviewId));
            }

            var sessionModel = new InterviewSession
            {
                SessionId = sessionId.Trim(),
                CandidateId = candidateId.Trim(),
                InterviewId = interviewId.Trim(),
                StartTime = DateTime.UtcNow,
                Status = SystemConstants.SessionStatus.InProgress,
                CreatedAt = DateTime.UtcNow
            };

            var createdSession =
                await _sessionRepository.CreateSessionAsync(sessionModel);

            if (createdSession == null)
            {
                throw new InvalidOperationException(
                    "Failed to persist the interview session in MongoDB.");
            }

            return createdSession;
        }

        /// <summary>
        /// Retrieves an interview session by its unique SessionId.
        ///
        /// Input:
        /// - sessionId: Unique interview session identifier.
        ///
        /// Output:
        /// - Returns the matching interview session or null when not found.
        /// </summary>
        public async Task<InterviewSession?> GetSessionByIdAsync(
            string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            return await _sessionRepository.GetSessionByIdAsync(
                sessionId.Trim());
        }

        /// <summary>
        /// Updates the lifecycle status of an interview session.
        ///
        /// Input:
        /// - sessionId: Unique interview session identifier.
        /// - status: New lifecycle status.
        ///
        /// Output:
        /// Returns true when the repository successfully updates the session.
        /// </summary>
        public async Task<bool> UpdateSessionStatusAsync(string sessionId, string status)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                throw new ArgumentException(
                    "Session ID cannot be null or whitespace.",
                    nameof(sessionId));
            }

            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException(
                    "Status cannot be null or whitespace.",
                    nameof(status));
            }

            return await _sessionRepository.UpdateSessionStatusAsync(
                sessionId.Trim(),
                status.Trim());
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

        /// <summary>
        /// Retrieves interview sessions using server-side pagination.
        ///
        /// Input:
        /// - page: Page number to retrieve.
        /// - pageSize: Maximum number of sessions per page.
        ///
        /// Output:
        /// - Returns interview sessions for the requested page along with
        ///   the total number of available sessions.
        /// </summary>
        public async Task<(
            IEnumerable<InterviewSession> Sessions,
            long TotalCount
        )> GetAllSessionsAsync(
            int page,
            int pageSize)
        {
            if (page < 1)
            {
                page = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            return await _sessionRepository.GetInterviewSessionsAsync(
                page,
                pageSize);
        }
    }
}