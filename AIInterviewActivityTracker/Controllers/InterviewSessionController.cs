using AIInterviewActivityTracker.DTOs;
using AIInterviewActivityTracker.DTOs.InterviewSession;
using AIInterviewActivityTracker.Interfaces;
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
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure("Invalid request payload."));
            }

            var result = await _sessionService.CreateSessionAsync(request);

            return Ok(
                ApiResponseDto<InterviewSessionResponse>.CreateSuccess(
                    result,
                    "Session created successfully."));
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
                return NotFound(
                    ApiResponseDto<string>.CreateFailure(
                        $"Session '{sessionId}' was not found."));
            }

            return Ok(
                ApiResponseDto<InterviewSessionResponse>.CreateSuccess(
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
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure("Invalid request payload."));
            }

            var isSuccess = await _sessionService.UpdateSessionStatusAsync(request);

            if (!isSuccess)
            {
                return NotFound(
                    ApiResponseDto<string>.CreateFailure(
                        "Session not found or status could not be updated."));
            }

            return Ok(
                ApiResponseDto<bool>.CreateSuccess(
                    true,
                    "Session status updated successfully."));
        }
    }
}