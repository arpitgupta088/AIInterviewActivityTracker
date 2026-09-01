using AIInterviewActivityTracker.Constants;
using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AIInterviewActivityTracker.Controllers
{
    /// <summary>
    /// Provides aggregated statistics and recent activity data
    /// required by the dashboard.
    /// </summary>
    [ApiController]
    [Route("api/v1/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly IInterviewSessionService _sessionService;
        private readonly IActivityEventService _eventService;

        public DashboardController(
            IInterviewSessionService sessionService,
            IActivityEventService eventService)
        {
            ArgumentNullException.ThrowIfNull(sessionService);
            ArgumentNullException.ThrowIfNull(eventService);

            _sessionService = sessionService;
            _eventService = eventService;
        }

        /// <summary>
        /// Retrieves aggregated interview session statistics.
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalSessionsTask =
                _sessionService.GetTotalSessionCountAsync();

            var activeSessionsTask =
                _sessionService.GetSessionCountByStatusAsync(
                    SystemConstants.SessionStatus.InProgress);

            var totalEventsTask =
               _eventService.GetTotalEventsCountAsync();

            await Task.WhenAll(
                totalSessionsTask,
                activeSessionsTask,
                totalEventsTask);

            var stats = new DashboardStats
            {
                TotalSessions = await totalSessionsTask,
                ActiveSessions = await activeSessionsTask,
                TotalEvents = await totalEventsTask
            };

            return base.Ok(
                ApiResponse<DashboardStats>.CreateSuccess(
                    stats,
                    "Dashboard statistics retrieved successfully."));
        }

        /// <summary>
        /// Retrieves the most recent activity events across all sessions.
        /// </summary>
        [HttpGet("recent-events")]
        [ProducesResponseType(
            typeof(ApiResponse<List<ActivityEvent>>), StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(ApiResponse<List<ActivityEvent>>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetRecentEvents(
            [FromQuery] int limit = 10)
        {
            if (limit < 1 || limit > 100)
            {
                return base.BadRequest(

                    ApiResponse<List<ActivityEvent>>.CreateFailure(
                    "Limit must be between 1 and 100."));
            }

            var events =
                await _eventService.GetRecentEventsAsync(limit);

            return base.Ok(
                ApiResponse<List<ActivityEvent>>.CreateSuccess(
                    events,
                    "Recent events retrieved successfully."));
        }

        /// <summary>
        /// Retrieves the complete activity timeline for a session.
        /// </summary>
        [HttpGet("timeline/{sessionId}")]
        [ProducesResponseType(
            typeof(ApiResponse<List<ActivityEvent>>),
            StatusCodes.Status200OK)]
        [ProducesResponseType(
            typeof(ApiResponse<string>),
            StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetSessionTimeline(
            string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "SessionId is required."));
            }

            var timeline =
                await _eventService.GetEventsBySessionIdAsync(
                    sessionId.Trim());

            return base.Ok(
                ApiResponse<List<ActivityEvent>>
                    .CreateSuccess(
                        timeline,
                        "Session timeline retrieved successfully."));
        }
    }
}