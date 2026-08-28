using AIInterviewActivityTracker.DTOs;
using AIInterviewActivityTracker.DTOs.ActivityEvent;
using AIInterviewActivityTracker.Interfaces;
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

        public ActivityEventController(IActivityEventService eventService)
        {
            ArgumentNullException.ThrowIfNull(eventService);
            _eventService = eventService;
        }

        /// <summary>
        /// Logs a single activity event.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> LogEvent([FromBody] CreateActivityEventRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure("Invalid request payload."));
            }

            await _eventService.LogEventAsync(request);

            return Ok(
                ApiResponseDto<string>.CreateSuccess(
                    "Event logged successfully.",
                    "Event recorded."));
        }

        /// <summary>
        /// Logs multiple activity events in a single request.
        /// </summary>
        [HttpPost("batch")]
        public async Task<IActionResult> LogBatchEvents([FromBody] IEnumerable<CreateActivityEventRequest> requests)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure("Invalid request payload."));
            }

            await _eventService.LogBatchEventsAsync(requests);

            return Ok(
                ApiResponseDto<string>.CreateSuccess(
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

            return Ok(
                ApiResponseDto<List<ActivityEventResponse>>.CreateSuccess(
                    events,
                    $"Retrieved {events.Count} event(s)."));
        }

        /// <summary>
        /// Logs an activity event received through the browser Beacon API.
        /// </summary>
        [HttpPost("beacon")]
        public async Task<IActionResult> LogBeaconEvent(
            [FromForm] CreateActivityEventRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Invalid beacon payload."));
            }

            await _eventService.LogEventAsync(request);

            return Ok(
                ApiResponseDto<string>.CreateSuccess(
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
            var (events, totalCount) =
                await _eventService.GetFilteredEventsAsync(
                    sessionId,
                    eventType,
                    startDate,
                    endDate,
                    page,
                    pageSize);

            var response = new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Events = events
            };

            return Ok(
                ApiResponseDto<object>.CreateSuccess(
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
        /// - Returns a success response after the events are queued for persistence.
        /// </summary>
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
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Beacon events payload is required."));
            }

            List<CreateActivityEventRequest>? requests;

            try
            {
                requests = JsonSerializer.Deserialize<
                    List<CreateActivityEventRequest>
                >(
                    events,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
            }
            catch (JsonException ex)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Invalid beacon events payload."));
            }

            if (requests == null || requests.Count == 0)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Beacon events payload is empty."));
            }

            var validRequests = requests
                .Where(request =>
                    request != null &&
                    !string.IsNullOrWhiteSpace(request.SessionId) &&
                    !string.IsNullOrWhiteSpace(request.CandidateId) &&
                    !string.IsNullOrWhiteSpace(request.EventType) &&
                    !string.IsNullOrWhiteSpace(request.Module))
                .ToList();

            if (validRequests.Count == 0)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Beacon payload did not contain valid activity events."));
            }

            await _eventService.LogBatchEventsAsync(validRequests);

            return Ok(
                 ApiResponseDto<int>.CreateSuccess(
                     validRequests.Count,
                        "Beacon batch events logged successfully."));
        }
    }
}