using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AIInterviewActivityTracker.Controllers
{
    /// <summary>
    /// API endpoints for logging and retrieving browser activity events.
    /// </summary>
    [ApiController]
    [Route("api/v1/activities")]
    public class ActivityEventController : ControllerBase
    {
        private readonly IActivityEventService _eventService;
        private readonly IValidator<ActivityEvent> _activityEventValidator;

        public ActivityEventController(IActivityEventService eventService, IValidator<ActivityEvent> activityEventValidator)
        {
            ArgumentNullException.ThrowIfNull(eventService);
            ArgumentNullException.ThrowIfNull(activityEventValidator);

            _eventService = eventService;
            _activityEventValidator = activityEventValidator;
        }

        /// <summary>
        /// Logs a single activity event.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> LogEvent([FromBody] ActivityEvent activityEvent)
        {
            if (!ModelState.IsValid)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure("Invalid request payload."));
            }

            await _eventService.LogEventAsync(activityEvent);

            return base.Ok(
                ApiResponse<string>.CreateSuccess(
                    "Event logged successfully.",
                    "Event recorded."));
        }

        /// <summary>
        /// Logs multiple activity events in a single request.
        /// </summary>
        [HttpPost("batch")]
        public async Task<IActionResult> LogBatchEvents([FromBody] IEnumerable<ActivityEvent> activityEvents)
        {
            if (!ModelState.IsValid)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure("Invalid request payload."));
            }

            await _eventService.LogBatchEventsAsync(activityEvents);

            return base.Ok(
                ApiResponse<string>.CreateSuccess(
                    "Batch events logged successfully.",
                    "Batch events recorded."));
        }

        /// <summary>
        /// Retrieves all activity events for a session.
        /// </summary>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetEventsBySessionId(string sessionId)
        {
            var events = await _eventService.GetEventsBySessionIdAsync(sessionId);

            return base.Ok(
                ApiResponse<List<ActivityEvent>>.CreateSuccess(
                    events,
                    $"Retrieved {events.Count} event(s)."));
        }

        /// <summary>
        /// Logs an activity event received through the browser Beacon API.
        /// </summary>
        [HttpPost("beacon")]
        public async Task<IActionResult> LogBeaconEvent(
            [FromForm] ActivityEvent activityEvent)
        {
            if (!ModelState.IsValid)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "Invalid beacon payload."));
            }

            await _eventService.LogEventAsync(activityEvent);

            return base.Ok(
                ApiResponse<string>.CreateSuccess(
                    "Beacon event logged successfully.",
                    "Beacon event recorded."));
        }

        /// <summary>
        /// Retrieves filtered activity events.
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchEvents(
            [FromQuery] string? sessionId,
            [FromQuery] string? eventType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {

            var validPage = page > 0
                    ? page
                    : 1;

            var validPageSize =
                pageSize > 0 && pageSize <= 100
                    ? pageSize
                    : 20;

            var (events, totalCount) =
                await _eventService.GetFilteredEventsAsync(
                    sessionId,
                    eventType,
                    startDate,
                    endDate,
                    validPage,
                    validPageSize);

            var response = new
            {
                TotalCount = totalCount,
                Page = validPage,
                PageSize = validPageSize,
                Events = events
            };

            return base.Ok(
                ApiResponse<object>.CreateSuccess(
                    response,
                    "Filtered events retrieved successfully."));
        }

        /// <summary>
        /// Logs multiple activity events received through the browser Beacon API.
        ///
        /// Input:
        /// - events: JSON string containing an array of activity event requests.
        ///
        /// Output:
        /// - Returns a success response after the activity events are persisted.
        /// </summary>
        [HttpPost("beacon-batch")]
        public async Task<IActionResult> LogBeaconBatchEvents(
            [FromForm] string events)
        {
            if (string.IsNullOrWhiteSpace(events))
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "Beacon events payload is required."));
            }

            List<ActivityEvent>? activityEvents;

            try
            {
                activityEvents = JsonSerializer.Deserialize<
                    List<ActivityEvent>
                >(
                    events,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
            }
            catch (JsonException)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "Invalid beacon events payload."));
            }

            if (activityEvents == null || activityEvents.Count == 0)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "Beacon events payload is empty."));
            }

            foreach (var activityEvent in activityEvents)
            {
                var validationResult = await _activityEventValidator.ValidateAsync(activityEvent);

                if (!validationResult.IsValid)
                {
                    var validationErrors = string.Join(
                        " ",
                        validationResult.Errors.Select(
                            error => error.ErrorMessage));

                    return base.BadRequest(
                        ApiResponse<string>.CreateFailure(
                            validationErrors));
                }
            }

            await _eventService.LogBatchEventsAsync(activityEvents);

            return base.Ok(
                ApiResponse<int>.CreateSuccess(
                    activityEvents.Count,
                    "Beacon batch events logged successfully."));
        }
    }
}