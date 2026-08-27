using AIInterviewActivityTracker.Database;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Handles MongoDB database queries for Interview Summaries.
    /// </summary>
    public class InterviewSummaryRepository : IInterviewSummaryRepository
    {
        private readonly IMongoCollection<InterviewSummary> _summaryCollection;

        public InterviewSummaryRepository(MongoDbContext dbContext)
        {
            ArgumentNullException.ThrowIfNull(dbContext);

            _summaryCollection = dbContext.GetCollection<InterviewSummary>(
                dbContext.Settings.InterviewSummaryCollection);
        }

        /// <summary>
        /// Persists a generated interview summary into MongoDB.
        /// </summary>

        public async Task<InterviewSummary> CreateSummaryAsync(InterviewSummary summary)
        {
            ArgumentNullException.ThrowIfNull(summary);

            if (string.IsNullOrWhiteSpace(summary.SessionId))
            {
                throw new ArgumentException("SessionId cannot be null or whitespace.", nameof(summary));
            }

            await _summaryCollection.InsertOneAsync(summary);
            return summary;
        }

        /// <summary>
        /// Retrieves an interview summary by SessionId.
        /// </summary>
        public async Task<InterviewSummary?> GetSummaryBySessionIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            var normalizedSessionId = sessionId.Trim();

            var filter =
                Builders<InterviewSummary>.Filter.Eq(
                    s => s.SessionId,
                    normalizedSessionId);

            return await _summaryCollection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Updates an existing interview summary in MongoDB.
        ///
        /// Input:
        /// summary - Interview summary containing the updated summary data
        /// and the session identifier.
        ///
        /// Output:
        /// Returns true when the summary is successfully updated;
        /// otherwise returns false.
        /// </summary>
        public async Task<bool> UpdateSummaryAsync(InterviewSummary summary)
        {
            ArgumentNullException.ThrowIfNull(summary);

            if (string.IsNullOrWhiteSpace(summary.SessionId))
            {
                return false;
            }

            var filter = Builders<InterviewSummary>.Filter.Eq(s => s.Id, summary.Id);
            summary.UpdatedAt = DateTime.UtcNow;

            var result = await _summaryCollection.ReplaceOneAsync(filter, summary);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        /// <summary>
        /// Checks whether an interview summary exists for a session.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns true when a summary exists for the session;
        /// otherwise returns false.
        /// </summary>
        public async Task<bool> SummaryExistsAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return false;
            }

            var filter = Builders<InterviewSummary>.Filter.Eq(s => s.SessionId, sessionId.Trim());
            var count = await _summaryCollection.CountDocumentsAsync(filter);

            return count > 0;
        }

        /// <summary>
        /// Retrieves the total number of interview summaries stored in MongoDB.
        ///
        /// Input:
        /// No input parameters.
        ///
        /// Output:
        /// Returns the total number of stored interview summaries.
        /// </summary>
        public async Task<long> GetTotalSummaryCountAsync()
        {
            return await _summaryCollection.CountDocumentsAsync(Builders<InterviewSummary>.Filter.Empty);
        }
    }
}