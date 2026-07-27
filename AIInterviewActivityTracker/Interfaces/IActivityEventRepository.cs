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
    }
}