using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for MongoDB ActivityEvent database operations.
    /// </summary>
    public interface IActivityEventRepository
    {
        /// <summary>
        /// Logs a single browser activity event.
        /// </summary>
        Task CreateEventAsync(ActivityEvent activityEvent);

        /// <summary>
        /// Logs a batch of activty events
        /// </summary>
        Task CreateBatchEventsAsync(IEnumerable<ActivityEvent> events);

        /// <summary>
        /// Retrieves all activity events associated with a session.
        /// </summary>
        Task<List<ActivityEvent>> GetEventsBySessionIdAsync(string sessionId);

        /// <summary>
        /// Retrieves the most recent activity events across all sessions.
        /// </summary>
        Task<List<ActivityEvent>> GetRecentEventsAsync(int limit);

        /// <summary>
        /// Retrieves the total count of all activity events in the database.
        /// </summary>
        Task<long> GetTotalEventsCountAsync();

        /// <summary>
        /// Retrieves filtered activity events along with the total matching count.
        /// </summary>
        Task<(List<ActivityEvent> Events, long TotalCount)> GetFilteredEventsAsync(
            string? sessionId,
            string? eventType,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize);
    }
}