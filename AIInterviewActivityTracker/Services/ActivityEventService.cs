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
        public async Task LogEventAsync(ActivityEvent activityEvent)
        {
            ArgumentNullException.ThrowIfNull(activityEvent);

            if (string.IsNullOrWhiteSpace(activityEvent.SessionId))
            {
                throw new ArgumentException(
                    "Session ID cannot be null or whitespace.",
                    nameof(activityEvent.SessionId));
            }

            if (string.IsNullOrWhiteSpace(activityEvent.CandidateId))
            {
                throw new ArgumentException(
                    "Candidate ID cannot be null or whitespace.",
                    nameof(activityEvent.CandidateId));
            }

            if (string.IsNullOrWhiteSpace(activityEvent.EventType))
            {
                throw new ArgumentException(
                    "Event type cannot be null or whitespace.",
                    nameof(activityEvent.EventType));
            }

            if (string.IsNullOrWhiteSpace(activityEvent.Module))
            {
                throw new ArgumentException(
                    "Module cannot be null or whitespace.",
                    nameof(activityEvent.Module));
            }

            var eventModel = new ActivityEvent
            {
                SessionId = activityEvent.SessionId.Trim(),
                CandidateId = activityEvent.CandidateId.Trim(),
                EventType = activityEvent.EventType.Trim(),
                Module = activityEvent.Module?.Trim() ?? string.Empty,
                MetadataJson = string.IsNullOrWhiteSpace(activityEvent.MetadataJson)
                    ? "{}"
                    : activityEvent.MetadataJson.Trim(),
                Timestamp = DateTime.UtcNow,
                SequenceNumber = activityEvent.SequenceNumber,
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
        public async Task LogBatchEventsAsync(IEnumerable<ActivityEvent> activityEvents)
        {
            ArgumentNullException.ThrowIfNull(activityEvents);

            var eventList = activityEvents.ToList();

            if (eventList.Count == 0)
            {
                return;
            }

            var eventModels = eventList
                .Where(activityEvent =>
                    activityEvent != null &&
                    !string.IsNullOrWhiteSpace(activityEvent.SessionId) &&
                    !string.IsNullOrWhiteSpace(activityEvent.CandidateId) &&
                    !string.IsNullOrWhiteSpace(activityEvent.EventType) &&
                    !string.IsNullOrWhiteSpace(activityEvent.Module))
                .Select(activityEvent => new ActivityEvent
                {
                    SessionId = activityEvent.SessionId.Trim(),
                    CandidateId = activityEvent.CandidateId.Trim(),
                    EventType = activityEvent.EventType.Trim(),
                    Module = activityEvent.Module?.Trim() ?? string.Empty,
                    MetadataJson = string.IsNullOrWhiteSpace(activityEvent.MetadataJson)
                        ? "{}"
                        : activityEvent.MetadataJson.Trim(),
                    Timestamp = DateTime.UtcNow,
                    SequenceNumber = activityEvent.SequenceNumber,
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
        /// Returns a list of activity events.
        /// </summary>
        public async Task<List<ActivityEvent>> GetEventsBySessionIdAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return new List<ActivityEvent>();
            }

            return await _eventRepository.GetEventsBySessionIdAsync(sessionId.Trim());
        }

        /// <summary>
        /// Retrieves the most recent activity events for dashboard display.
        /// </summary>
        public async Task<List<ActivityEvent>> GetRecentEventsAsync(
            int limit)
        {
            if (limit <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(limit),
                    "Limit must be greater than zero.");
            }

            return await _eventRepository.GetRecentEventsAsync(limit);
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
        public async Task<(List<ActivityEvent> Events, long TotalCount)> GetFilteredEventsAsync(
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

            return await _eventRepository.GetFilteredEventsAsync(
                sessionId,
                eventType,
                startDate,
                endDate,
                validPage,
                validPageSize);
            } 
        }
    }