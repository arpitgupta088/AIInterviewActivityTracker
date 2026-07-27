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

        public async Task LogBatchEventsAsync(IEnumerable<CreateActivityEventRequest> requests)
        {
            ArgumentNullException.ThrowIfNull(requests);

            var requestList = requests.ToList();

            if (requestList.Count == 0)
            {
                return;
            }

            var eventModels = requestList
                .Where(r =>
                    !string.IsNullOrWhiteSpace(r.SessionId) &&
                    !string.IsNullOrWhiteSpace(r.EventType))
                .Select(r => new ActivityEvent
                {
                    SessionId = r.SessionId.Trim(),
                    CandidateId = r.CandidateId.Trim(),
                    EventType = r.EventType.Trim(),
                    Module = r.Module?.Trim() ?? string.Empty,
                    MetadataJson = string.IsNullOrWhiteSpace(r.MetadataJson)
                        ? "{}"
                        : r.MetadataJson.Trim(),
                    Timestamp = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                });

            await _eventRepository.CreateBatchEventsAsync(eventModels);
        }

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