using AIInterviewActivityTracker.Repositories;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Text.RegularExpressions;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Handles MongoDB database operations for activity events.
    /// </summary>
    public class ActivityEventRepository : IActivityEventRepository
    {
        private readonly IMongoCollection<ActivityEvent> _eventsCollection;

        public ActivityEventRepository(MongoDbContext dbContext)
        {
            ArgumentNullException.ThrowIfNull(dbContext);
            _eventsCollection = dbContext.GetCollection<ActivityEvent>(
                dbContext.Settings.ActivityEventsCollection);
        }

        /// <summary>
        /// Inserts a single activity event into MongoDB.
        /// </summary>
        public async Task CreateEventAsync(ActivityEvent activityEvent)
        {
            ArgumentNullException.ThrowIfNull(activityEvent);

            if (string.IsNullOrWhiteSpace(activityEvent.SessionId))
            {
                throw new ArgumentException("SessionId is required.", nameof(activityEvent));
            }

            activityEvent.CreatedAt = DateTime.UtcNow;

            await _eventsCollection.InsertOneAsync(activityEvent);
        }

        /// <summary>
        /// Inserts multiple events efficiently.
        /// </summary>
        public async Task CreateBatchEventsAsync(IEnumerable<ActivityEvent> events)
        {
            ArgumentNullException.ThrowIfNull(events);
            var eventList = events.ToList();
            if (eventList.Count == 0)
            {
                return;
            }

            foreach (var activityEvent in eventList)
            {
                activityEvent.CreatedAt = DateTime.UtcNow;
            }

            await _eventsCollection.InsertManyAsync(eventList);
        }

        /// <summary>
        /// Fetches all events for a specific session.
        /// </summary>
        public async Task<List<ActivityEvent>> GetEventsBySessionIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return new List<ActivityEvent>();
            }

            var normalizedSessionId = sessionId.Trim();

            var filter = Builders<ActivityEvent>.Filter.Eq(
                e => e.SessionId,
                normalizedSessionId);

            return await _eventsCollection
                .Find(filter).SortBy(e => e.SequenceNumber).ThenBy(e => e.Timestamp).ThenBy(e => e.CreatedAt)
                .ToListAsync();
        }

            /// <summary>
            /// Retrieves the most recent activity events across all sessions.
            /// </summary>
        public async Task<List<ActivityEvent>> GetRecentEventsAsync(int limit)
        {
            if (limit <= 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(limit),
                    "Limit must be greater than zero.");
            }

            return await _eventsCollection
                .Find(Builders<ActivityEvent>.Filter.Empty)
                .SortByDescending(e => e.Timestamp)
                .ThenByDescending(e => e.CreatedAt)
                .Limit(limit)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves the total number of activity events.
        /// </summary>
        public async Task<long> GetTotalEventsCountAsync()
        {
            return await _eventsCollection.CountDocumentsAsync(
                Builders<ActivityEvent>.Filter.Empty);
        }

        /// <summary>
        /// Retrieves filtered activity events with pagination.
        /// </summary>
        public async Task<(List<ActivityEvent> Events, long TotalCount)> GetFilteredEventsAsync(
            string? sessionId,
            string? eventType,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize)
        {
            var builder = Builders<ActivityEvent>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrWhiteSpace(sessionId))
            {
                var searchText = Regex.Escape(sessionId.Trim());

                var sessionFilter = builder.Regex(
                    e => e.SessionId,
                    new BsonRegularExpression(searchText, "i"));

                var candidateFilter = builder.Regex(
                    e => e.CandidateId,
                    new BsonRegularExpression(searchText, "i"));

                filter &= builder.Or(sessionFilter, candidateFilter);
            }

            if (!string.IsNullOrWhiteSpace(eventType))
            {
                var searchText = Regex.Escape(eventType.Trim());

                filter &= builder.Regex(
                    e => e.EventType,
                    new BsonRegularExpression(searchText, "i"));
            }

            if (startDate.HasValue)
            {
                filter &= builder.Gte(
                    e => e.Timestamp,
                    startDate.Value);
            }

            if (endDate.HasValue)
            {
                filter &= builder.Lte(
                    e => e.Timestamp,
                    endDate.Value);
            }

            var totalCount =
                await _eventsCollection.CountDocumentsAsync(filter);

            var events =
                await _eventsCollection
                    .Find(filter)
                    .SortByDescending(e => e.Timestamp)
                    .ThenByDescending(e => e.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();

            return (events, totalCount);
        }
    }
}