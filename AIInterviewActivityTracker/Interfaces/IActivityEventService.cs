using AIInterviewActivityTracker.DTOs.ActivityEvent;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Activity Event logging and retrieval business operations.
    /// </summary>
    public interface IActivityEventService
    {
        /// <summary>
        /// Logs a single activity event from the client.
        /// </summary>
        Task LogEventAsync(CreateActivityEventRequest request);

        /// <summary>
        /// Logs multiple activity events in a single operation.
        /// </summary>
        Task LogBatchEventsAsync(IEnumerable<CreateActivityEventRequest> requests);

        /// <summary>
        /// Retrieves all activity events associated with a session.
        /// </summary>
        Task<List<ActivityEventResponse>> GetEventsBySessionIdAsync(string sessionId);

        /// <summary>
        /// Retrieves the most recent activity events for dashboard display.
        /// </summary>
        Task<List<ActivityEventResponse>> GetRecentEventsAsync(int limit);

        /// <summary>
        /// Retrieves the total count of all logged activity events
        /// </summary>
        Task<long> GetTotalEventsCountAsync();

        /// <summary>
        /// Retrieves filtered activity events with pagination.
        /// </summary>
        Task<(List<ActivityEventResponse> Events, long TotalCount)> GetFilteredEventsAsync(
            string? sessionId,
            string? eventType,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize);
    }
}