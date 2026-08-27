using AIInterviewActivityTracker.DTOs.ActivityEvent;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Services
{
    /// <summary>
    /// Business logic service for logging and retrieving client activity events.
    /// Injects IActivityEventRepository via Dependency Injection.
    /// </summary>
    public class ActivityEventService : IActivityEventService
    {
        private readonly IActivityEventRepository _eventRepository;

        public ActivityEventService(IActivityEventRepository eventRepository)
        {
            ArgumentNullException.ThrowIfNull(eventRepository);
            _eventRepository = eventRepository;
        }

        /// <summary>
        /// Logs a single activity event received from the client.
        ///
        /// Input:
        /// request - Activity event request containing session, candidate,
        /// event type, module, and optional metadata.
        ///
        /// Output:
        /// No return value. The event is persisted through the activity repository.
        /// </summary>
        public async Task LogEventAsync(CreateActivityEventRequest request)
        {
            ArgumentNullException.ThrowIfNull(request);

            var eventModel = new ActivityEvent
            {
                SessionId = request.SessionId.Trim(),
                CandidateId = request.CandidateId.Trim(),
                EventType = request.EventType.Trim(),
                Module = request.Module?.Trim() ?? string.Empty,
                MetadataJson = string.IsNullOrWhiteSpace(request.MetadataJson)
                    ? "{}"
                    : request.MetadataJson.Trim(),
                Timestamp = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            await _eventRepository.CreateEventAsync(eventModel);
        }

        /// <summary>
        /// Logs multiple activity events in a single operation.
        ///
        /// Input:
        /// requests - Collection of activity event requests to be persisted.
        ///
        /// Output:
        /// No return value. Valid events are persisted through the repository.
        /// </summary>
        public async Task LogBatchEventsAsync(IEnumerable<CreateActivityEventRequest> requests)
        {
            ArgumentNullException.ThrowIfNull(requests);

            var requestList = requests.ToList();

            if (requestList.Count == 0)
            {
                return;
            }

            var eventModels = requestList
                .Where(request =>
                    request != null &&
                    !string.IsNullOrWhiteSpace(request.SessionId) &&
                    !string.IsNullOrWhiteSpace(request.EventType))
                .Select(request => new ActivityEvent
                {
                    SessionId = request.SessionId.Trim(),
                    CandidateId = request.CandidateId?.Trim() ?? string.Empty,
                    EventType = request.EventType.Trim(),
                    Module = request.Module?.Trim() ?? string.Empty,
                    MetadataJson = string.IsNullOrWhiteSpace(request.MetadataJson)
                        ? "{}"
                        : request.MetadataJson.Trim(),
                    Timestamp = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            if (eventModels.Count == 0)
            {
                return;
            }

            await _eventRepository.CreateBatchEventsAsync(eventModels);
        }

        /// <summary>
        /// Retrieves all activity events associated with an interview session.
        ///
        /// Input:
        /// sessionId - Unique identifier of the interview session.
        ///
        /// Output:
        /// Returns a list of activity event response DTOs.
        /// </summary>
        public async Task<List<ActivityEventResponse>> GetEventsBySessionIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return new List<ActivityEventResponse>();
            }

            var events = await _eventRepository.GetEventsBySessionIdAsync(sessionId.Trim());

            return events
                .Select(MapToResponse)
                .ToList();
        }

        /// <summary>
        /// Retrieves the most recent activity events for dashboard display.
        /// </summary>
        public async Task<List<ActivityEventResponse>> GetRecentEventsAsync(
            int limit)
        {
            if (limit <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(limit),
                    "Limit must be greater than zero.");
            }

            var events = await _eventRepository.GetRecentEventsAsync(limit);

            return events
                .Select(MapToResponse)
                .ToList();
        }

        /// <summary>
        /// Retrieves the total number of activity events.
        /// </summary>
        public async Task<long> GetTotalEventsCountAsync()
        {
            return await _eventRepository.GetTotalEventsCountAsync();
        }

        /// <summary>
        /// Retrieves filtered activity events with pagination.
        /// </summary>
        public async Task<(List<ActivityEventResponse> Events, long TotalCount)> GetFilteredEventsAsync(
            string? sessionId,
            string? eventType,
            DateTime? startDate,
            DateTime? endDate,
            int page,
            int pageSize)
        {
            var validPage = page > 0
                ? page
                : 1;

            var validPageSize =
                pageSize > 0 && pageSize <= 100
                    ? pageSize
                    : 20;

            var (events, totalCount) =
                await _eventRepository.GetFilteredEventsAsync(
                    sessionId,
                    eventType,
                    startDate,
                    endDate,
                    validPage,
                    validPageSize);

            return (
                events.Select(MapToResponse).ToList(),
                totalCount);
        }

        /// <summary>
        /// Maps an ActivityEvent model to the ActivityEventResponse DTO.
        /// </summary>
        private static ActivityEventResponse MapToResponse(ActivityEvent model)
        {
            return new ActivityEventResponse
            {
                Id = model.Id ?? string.Empty,
                SessionId = model.SessionId,
                CandidateId = model.CandidateId,
                EventType = model.EventType,
                Module = model.Module,
                Timestamp = model.Timestamp,
                MetadataJson = model.MetadataJson
            };
        }
    }
}