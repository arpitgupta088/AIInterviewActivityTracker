using AIInterviewActivityTracker.Database;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Handles MongoDB database queries for Interview Sessions.
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
                throw new ArgumentException("SessionId cannot be null or whitespace.", nameof(session));
            }

            await _sessionsCollection.InsertOneAsync(session);
            return session;
        }

        /// <summary>
        /// Retrieves an interview session document using its SessionId.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns the matching interview session, or null when not found.
        /// </summary>
        public async Task<InterviewSession?> GetSessionByIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return null;
            }

            var normalizedSessionId = sessionId.Trim();

            var filter = Builders<InterviewSession>.Filter.Eq(s => s.SessionId, normalizedSessionId);
            return await _sessionsCollection.Find(filter).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Updates the status and timestamps of an existing interview session.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        /// status - New status to assign to the session.
        ///
        /// Output:
        /// Returns true when the session is successfully matched and updated;
        /// otherwise returns false.
        /// </summary>
        public async Task<bool> UpdateSessionStatusAsync(string sessionId, string status)
        {
            if (string.IsNullOrWhiteSpace(sessionId) || string.IsNullOrWhiteSpace(status))
            {
                return false;
            }

            var normalizedSessionId = sessionId.Trim();

            var normalizedStatus = status.Trim();

            var filter = Builders<InterviewSession>.Filter.Eq(s => s.SessionId, normalizedSessionId);
            var update = Builders<InterviewSession>.Update.Set(s => s.Status, normalizedStatus).Set(s => s.UpdatedAt, DateTime.UtcNow);

            if(normalizedStatus.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase) ||
                normalizedStatus.Equals("ABORTED", StringComparison.OrdinalIgnoreCase))
            {
                update = update.Set(s => s.EndTime, DateTime.UtcNow);
            }

            var result = await _sessionsCollection.UpdateOneAsync(filter, update);
            return result.IsAcknowledged && result.MatchedCount > 0;
        }

        /// <summary>
        /// Retrieves the total number of interview sessions stored in MongoDB.
        ///
        /// Input:
        /// No input parameters.
        ///
        /// Output:
        /// Returns the total number of interview sessions.
        /// </summary>
        public async Task<long> GetTotalSessionCountAsync()
        {
            return await _sessionsCollection.CountDocumentsAsync(Builders<InterviewSession>.Filter.Empty);
        }

        /// <summary>
        /// Returns the number of interview sessions matching a status.
        /// </summary>
        public async Task<long> GetSessionCountByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException(
                    "Status cannot be null or whitespace.",
                    nameof(status));
            }

            var normalizedStatus = status.Trim();

            var filter = Builders<InterviewSession>.Filter.Eq(
                s => s.Status,
                normalizedStatus);

            return await _sessionsCollection.CountDocumentsAsync(filter);
        }

        /// <summary>
        /// Retrieves all completed interview sessions.
        /// </summary>
        public async Task<List<InterviewSession>> GetCompletedSessionsAsync()
        {
            var filter = Builders<InterviewSession>.Filter.Eq(
                s => s.Status,
                "COMPLETED");

            return await _sessionsCollection
                .Find(filter)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves interview sessions from MongoDB using server-side pagination.
        ///
        /// Input:
        /// - page: The page number to retrieve. Page numbering starts from 1.
        /// - pageSize: The maximum number of interview sessions to retrieve
        ///   for the requested page.
        ///
        /// Output:
        /// - Returns a tuple containing:
        ///   - Sessions: The interview sessions for the requested page,
        ///     ordered by StartTime in descending order.
        ///   - TotalCount: The total number of interview sessions available
        ///     in the database before pagination is applied.
        /// </summary>
        /// 
        public async Task<(IEnumerable<InterviewSession> Sessions, long TotalCount)>
            GetInterviewSessionsAsync(
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

            var filter = Builders<InterviewSession>.Filter.Empty;

            var totalCount = await _sessionsCollection
                .CountDocumentsAsync(filter);

            var skip = (page - 1) * pageSize;

            var sessions = await _sessionsCollection
                .Find(filter)
                .SortByDescending(session => session.StartTime)
                .Skip(skip)
                .Limit(pageSize)
                .ToListAsync();

            return (sessions, totalCount);
        }
    }
}