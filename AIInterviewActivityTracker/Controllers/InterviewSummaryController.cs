using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AIInterviewActivityTracker.Controllers
{
    /// <summary>
    /// API endpoints for managing interview summaries.
    /// </summary>
    [ApiController]
    [Route("api/v1/interview-summaries")]
    public class InterviewSummaryController : ControllerBase
    {
        private readonly IInterviewSummaryService _summaryService;
        private readonly IInterviewSummaryGenerator _summaryGenerator;

        public InterviewSummaryController(
            IInterviewSummaryService summaryService,
            IInterviewSummaryGenerator summaryGenerator)
        {
            ArgumentNullException.ThrowIfNull(summaryService);
            ArgumentNullException.ThrowIfNull(summaryGenerator);

            _summaryService = summaryService;
            _summaryGenerator = summaryGenerator;
        }

        /// <summary>
        /// Retrieves an interview summary by SessionId.
        /// </summary>
        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetSummaryBySessionId(
            string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "SessionId is required."));
            }

            var result =
                await _summaryService.GetSummaryBySessionIdAsync(sessionId);

            if (result == null)
            {
                return base.NotFound(
                    ApiResponse<string>.CreateFailure(
                        $"Summary for session '{sessionId}' was not found."));
            }

            return base.Ok(
                ApiResponse<InterviewSummary>.CreateSuccess(
                    result,
                    "Interview summary retrieved successfully."));
        }

        /// <summary>
        /// Generates an interview summary for a completed session.
        /// </summary>
        [HttpPost("generate/{sessionId}")]
        public async Task<IActionResult> GenerateSummary(
            string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "SessionId is required."));
            }

            var summary =
                await _summaryGenerator.GenerateSummaryAsync(sessionId);

            if (summary == null)
            {
                return base.BadRequest(
                    ApiResponse<string>.CreateFailure(
                        "Summary could not be generated."));
            }

            var response =
                await _summaryService.GetSummaryBySessionIdAsync(sessionId);

            return base.Ok(
                ApiResponse<InterviewSummary>.CreateSuccess(
                    response!,
                    "Interview summary generated successfully."));
        }

        /// <summary>
        /// Returns the total number of generated interview summaries.
        /// </summary>
        [HttpGet("count")]
        public async Task<IActionResult> GetSummaryCount()
        {
            var count =
                await _summaryService.GetTotalSummaryCountAsync();

            return base.Ok(
                ApiResponse<long>.CreateSuccess(
                    count,
                    "Interview summary count retrieved successfully."));
        }
    }
}