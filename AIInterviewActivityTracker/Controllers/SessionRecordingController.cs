using AIInterviewActivityTracker.Models;
using AIInterviewActivityTracker.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AIInterviewActivityTracker.Controllers;

/// <summary>
/// API endpoints for complete interview session recordings
/// </summary>
[ApiController]
[Route("api/v1/session-recordings")]
public class SessionRecordingController : ControllerBase
{
    private readonly ISessionRecordingService _sessionRecordingService;

    public SessionRecordingController(
        ISessionRecordingService sessionRecordingService)
    {
        ArgumentNullException.ThrowIfNull(sessionRecordingService);

        _sessionRecordingService = sessionRecordingService;
    }

    /// <summary>
    /// Uploads the complete recording of an interview session.
    /// </summary>
    [HttpPost("upload/{sessionId}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        string sessionId,
        [FromQuery] string candidateId,
        [FromQuery] DateTime startedAt,
        [FromQuery] DateTime? endedAt,
        IFormFile recording)
    {
        var result = await _sessionRecordingService.UploadAsync(
            sessionId,
            candidateId,
            recording,
            startedAt,
            endedAt);

        return base.Ok(
            ApiResponse<SessionRecording>.CreateSuccess(
                result,
                "Session recording uploaded successfully."));
    }

    /// <summary>
    /// Retrieves the complete recording associated with an interview session.
    /// </summary>
    [HttpGet("session/{sessionId}")]
    public async Task<IActionResult> GetBySessionId(string sessionId)
    {
        var recording = await _sessionRecordingService.GetBySessionIdAsync(sessionId);

        if (recording is null)
        {
            return base.NotFound(
                ApiResponse<string>.CreateFailure(
                    $"No session recording was found for session '{sessionId}'."));
        }

        return base.Ok(
            ApiResponse<SessionRecording>.CreateSuccess(
                recording,
                "Session recording retrieved successfully."));
    }

    /// <summary>
    /// Streams a complete session recording for browser playback.
    /// </summary>
    [HttpGet("{recordingId}/stream")]
    public async Task<IActionResult> Stream(
        string recordingId)
    {
        var result = await _sessionRecordingService.GetStreamAsync(recordingId);

        return File(
            result.Stream,
            result.ContentType,
            enableRangeProcessing: true);
    }

    /// <summary>
    /// Deletes a complete session recording and its physical file.
    /// </summary>
    [HttpDelete("{recordingId}")]
    public async Task<IActionResult> Delete(string recordingId)
    {
        var deleted =
            await _sessionRecordingService.DeleteAsync(recordingId);

        if (!deleted)
        {
            return base.NotFound(
                ApiResponse<string>.CreateFailure(
                    $"Session recording '{recordingId}' was not found."));
        }

        return base.Ok(
            ApiResponse<bool>.CreateSuccess(
                true,
                "Session recording deleted successfully."));
    }
}