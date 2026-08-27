using AIInterviewActivityTracker.DTOs;
using AIInterviewActivityTracker.DTOs.Recording;
using AIInterviewActivityTracker.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AIInterviewActivityTracker.Controllers
{
    /// <summary>
    /// API endpoints for uploading and managing interview recordings.
    /// </summary>
    [ApiController]
    [Route("api/v1/recordings")]
    public class RecordingController : ControllerBase
    {
        private readonly IRecordingService _recordingService;

        public RecordingController(IRecordingService recordingService)
        {
            ArgumentNullException.ThrowIfNull(recordingService);
            _recordingService = recordingService;
        }

        /// <summary>
        /// Uploads a recording associated with an interview session.
        /// </summary>
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadRecording(
            [FromForm] UploadRecordingRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ApiResponseDto<string>.CreateFailure(
                        "Invalid recording upload request."));
            }

            var result = await _recordingService.UploadRecordingAsync(
                request.SessionId,
                request);

            return Ok(
                ApiResponseDto<RecordingResponse>.CreateSuccess(
                    result,
                    "Recording uploaded successfully."));
        }

        /// <summary>
        /// Retrieves all recordings associated with an interview session.
        /// </summary>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetRecordingsBySessionId(string sessionId)
        {
            var recordings =
                await _recordingService.GetRecordingsBySessionIdAsync(sessionId);

            return Ok(
                ApiResponseDto<List<RecordingResponse>>.CreateSuccess(
                    recordings,
                    $"Retrieved {recordings.Count} recording(s)."));
        }

        /// <summary>
        /// Streams a recording for browser playback.
        /// </summary>
        [HttpGet("{recordingId}/stream")]
        public async Task<IActionResult> StreamRecording(
            string recordingId)
        {
            var result = await _recordingService.GetRecordingStreamAsync(recordingId);

            return File(
                result.Stream,
                result.ContentType,
                enableRangeProcessing: true);
        }

        /// <summary>
        /// Deletes a recording and its associated file.
        /// </summary>
        [HttpDelete("{recordingId}")]
        public async Task<IActionResult> DeleteRecording(string recordingId)
        {
            var deleted =
                await _recordingService.DeleteRecordingAsync(recordingId);

            if (!deleted)
            {
                return NotFound(
                    ApiResponseDto<string>.CreateFailure(
                        $"Recording '{recordingId}' was not found."));
            }

            return Ok(
                ApiResponseDto<bool>.CreateSuccess(
                    true,
                    "Recording deleted successfully."));
        }
    }
}