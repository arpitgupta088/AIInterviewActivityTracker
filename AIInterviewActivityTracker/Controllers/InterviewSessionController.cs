using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Services;
using Microsoft.AspNetCore.Mvc;

namespace AIInterviewActivityTracker.Controllers
{
    /// <summary>
    /// API endpoints for managing interview tracking sessions.
    /// </summary>
    [ApiController]
    [Route("api/v1/sessions")]
    public class InterviewSessionController : ControllerBase
    {
        private readonly IInterviewSessionService _sessionService;

        public InterviewSessionController(IInterviewSessionService sessionService)
        {
            ArgumentNullException.ThrowIfNull(sessionService);
            _sessionService = sessionService;
        }

        /// <summary>
        /// Creates a new candidate interview session.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSession([FromBody] CreateInterviewSessionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure("Invalid request payload."));
            }

            var result = await _sessionService.CreateSessionAsync(request.SessionId, request.CandidateId, request.InterviewId);

            return base.Ok(
                ApiResponse<object>.CreateSuccess(
                    result,
                    "Session created successfully."));
        }

        /// <summary>
        /// Retrieves interview sessions using server-side pagination.
        ///
        /// Input:
        /// - page: The page number to retrieve. Page numbering starts from 1.
        /// - pageSize: The maximum number of interview sessions to retrieve
        ///   for the requested page.
        ///
        /// Output:
        /// - Returns the paginated interview sessions along with the total
        ///   number of sessions and pagination information.
        /// </summary>
        /// 
        [HttpGet]
        public async Task<IActionResult> GetAllSessions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1)
            {
                page = 1;
            }

            if (pageSize < 1 || pageSize > 100)
            {
                pageSize = 10;
            }

            var (sessions, totalCount) =
                await _sessionService.GetAllSessionsAsync(
                    page,
                    pageSize);

            var response = new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Sessions = sessions
            };
            return base.Ok(ApiResponse<object>.CreateSuccess(response,
            "Interview sessions retrieved successfully."));
        }

        /// <summary>
        /// Retrieves an interview session by SessionId.
        /// </summary>
        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSessionById(string sessionId)
        {
            var result = await _sessionService.GetSessionByIdAsync(sessionId);

            if (result == null)
            {
                return base.NotFound(
                    ApiResponse<string>.CreateFailure(
                        $"Session '{sessionId}' was not found."));
            }

            return base.Ok(
                ApiResponse<object>.CreateSuccess(
                    result,
                    "Session retrieved successfully."));
        }

        /// <summary>
        /// Updates the status of an interview session.
        /// </summary>
        [HttpPatch("status")]
        public async Task<IActionResult> UpdateSessionStatus([FromBody] UpdateInterviewSessionRequest request)
        {
            if (!ModelState.IsValid)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure("Invalid request payload."));
            }

            var isSuccess = await _sessionService.UpdateSessionStatusAsync(request.SessionId, request.Status);

            if (!isSuccess)
            {
                return base.NotFound(
                    ApiResponse<string>.CreateFailure(
                        "Session not found or status could not be updated."));
            }

            return base.Ok(
                ApiResponse<bool>.CreateSuccess(
                    true,
                    "Session status updated successfully."));
        }
    }
}