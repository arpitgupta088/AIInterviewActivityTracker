using AIInterviewActivityTracker.DTOs.ActivityEvent;

namespace AIInterviewActivityTracker.Interfaces
{
    /// <summary>
    /// Contract for Activity Event logging business logic operations.
    /// </summary>
    public interface IActivityEventService
    {
        Task LogEventAsync(CreateActivityEventRequest request);

        Task LogBatchEventsAsync(IEnumerable<CreateActivityEventRequest> requests);

        Task<List<ActivityEventResponse>> GetEventsBySessionIdAsync(string sessionId);
    }
}