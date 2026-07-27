using AIInterviewActivityTracker.DTOs;
using AIInterviewActivityTracker.DTOs.ActivityEvent;
using AIInterviewActivityTracker.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
    }
}