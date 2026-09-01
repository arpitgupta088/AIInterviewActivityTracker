using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Services
{
    /// <summary>
    /// Business logic service for managing Interview Summaries.
    /// Acts as a bridge between Controllers/Generators and the Repository.
    /// </summary>
    public class InterviewSummaryService : IInterviewSummaryService
    {
        private readonly IInterviewSummaryRepository _summaryRepository;

        public InterviewSummaryService(IInterviewSummaryRepository summaryRepository)
        {
            ArgumentNullException.ThrowIfNull(summaryRepository);
            _summaryRepository = summaryRepository;
        }

        /// <summary>
        /// Creates and persists an interview summary.
        ///
        /// Input:
        /// summary - Interview summary model containing aggregated session data.
        ///
        /// Output:
        /// Returns the persisted interview summary model.
        /// </summary>
        public async Task<InterviewSummary> CreateSummaryAsync(InterviewSummary summary)
        {
            ArgumentNullException.ThrowIfNull(summary);

            return await _summaryRepository.CreateSummaryAsync(summary);
        }

        /// <summary>
        /// Retrieves an interview summary using its SessionId.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns the matching summary, or null when no summary exists.
        /// </summary>
        public async Task<InterviewSummary?> GetSummaryBySessionIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            // Sanitize input to prevent query misses due to leading or trailing whitespace
            return await _summaryRepository.GetSummaryBySessionIdAsync(
                sessionId.Trim());

        }

        /// <summary>
        /// Updates an existing interview summary.
        ///
        /// Input:
        /// summary - Summary model containing the updated summary information.
        ///
        /// Output:
        /// Returns true when the summary is successfully updated; otherwise false.
        /// </summary>
        public async Task<bool> UpdateSummaryAsync(InterviewSummary summary)
        {
            ArgumentNullException.ThrowIfNull(summary);
            return await _summaryRepository.UpdateSummaryAsync(summary);
        }

        /// <summary>
        /// Checks whether an interview summary exists for a session.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns true when a summary exists; otherwise false.
        /// </summary>
        public async Task<bool> SummaryExistsAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return false;
            }

            // Ensure the session ID is sanitized before querying the database
            return await _summaryRepository.SummaryExistsAsync(
                sessionId.Trim());
        }

        /// <summary>
        /// Retrieves the total number of generated interview summaries.
        ///
        /// Input:
        /// No input parameters.
        ///
        /// Output:
        /// Returns the total number of summaries as a long value.
        /// </summary>
        public async Task<long> GetTotalSummaryCountAsync()
        {
            return await _summaryRepository.GetTotalSummaryCountAsync();
        }
    }
}