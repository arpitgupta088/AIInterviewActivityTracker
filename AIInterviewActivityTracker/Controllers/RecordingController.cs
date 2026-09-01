using AIInterviewActivityTracker.Models;
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
        [HttpPost("upload/{sessionId}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadRecording(
            string sessionId,
            [FromQuery] string candidateId,
            [FromQuery] int questionNumber,
            IFormFile recording)
        {
            var result = await _recordingService.UploadRecordingAsync(
                sessionId,
                candidateId,
                questionNumber,
                recording);

            return base.Ok(
                ApiResponse<Recording>.CreateSuccess(
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

            return base.Ok(
                ApiResponse<List<Recording>>.CreateSuccess(
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
                return base.NotFound(
                    ApiResponse<string>.CreateFailure(
                        $"Recording '{recordingId}' was not found."));
            }

            return base.Ok(
                ApiResponse<bool>.CreateSuccess(
                    true,
                    "Recording deleted successfully."));
        }
    }
}