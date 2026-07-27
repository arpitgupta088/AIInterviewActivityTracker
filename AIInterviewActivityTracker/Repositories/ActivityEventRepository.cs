using AIInterviewActivityTracker.Database;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Handles MongoDB database queries for raw Activity Events.
    /// Supports both single logging and batch uploads.
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
        /// Inserts a single event into MongoDB.
        /// </summary>
        public async Task CreateEventAsync(ActivityEvent activityEvent)
        {
            ArgumentNullException.ThrowIfNull(activityEvent);

            if (string.IsNullOrWhiteSpace(activityEvent.SessionId))
            {
                throw new ArgumentException("SessionId is required.", nameof(activityEvent.SessionId));
            }

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

            var filter = Builders<ActivityEvent>.Filter.Eq(e => e.SessionId, sessionId.Trim());
            return await _eventsCollection.Find(filter).ToListAsync();
        }
    }
}