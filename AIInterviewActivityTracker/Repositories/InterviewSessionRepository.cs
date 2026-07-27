using AIInterviewActivityTracker.Database;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Handles MongoDB database queries for Interview Sessions.
    /// Injects Singleton MongoDbContext safely via Dependency Injection.
    /// </summary>
    public class InterviewSessionRepository : IInterviewSessionRepository
    {
        private readonly IMongoCollection<InterviewSession> _sessionsCollection;

        public InterviewSessionRepository(MongoDbContext dbContext)
        {
            ArgumentNullException.ThrowIfNull(dbContext);

            _sessionsCollection = dbContext.GetCollection<InterviewSession>(
                dbContext.Settings.InterviewSessionCollection);
        }

        /// <summary>
        /// Inserts a new session document into MongoDB.
        /// </summary>
        public async Task<InterviewSession> CreateSessionAsync(InterviewSession session)
        {
            ArgumentNullException.ThrowIfNull(session);

            if (string.IsNullOrWhiteSpace(session.SessionId))
            {
                throw new ArgumentException("SessionId cannot be null or whitespace.", nameof(session.SessionId));
            }

            await _sessionsCollection.InsertOneAsync(session);
            return session;
        }

        /// <summary>
        /// Fetches session document matching the SessionId.
        /// </summary>
        public async Task<InterviewSession?> GetSessionByIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            var filter = Builders<InterviewSession>.Filter.Eq(s => s.SessionId, sessionId.Trim());
            return await _sessionsCollection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Updates session status and refreshed timestamp.
        /// </summary>
        public async Task<bool> UpdateSessionStatusAsync(string sessionId, string status)
        {
            if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(status))
            {
                return false;
            }

            var filter = Builders<InterviewSession>.Filter.Eq(s => s.SessionId, sessionId.Trim());
            var update = Builders<InterviewSession>.Update
                .Set(s => s.Status, status.Trim())
                .Set(s => s.UpdatedAt, DateTime.UtcNow);

            var result = await _sessionsCollection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}