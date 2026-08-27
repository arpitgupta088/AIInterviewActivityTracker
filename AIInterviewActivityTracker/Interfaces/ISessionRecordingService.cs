using AIInterviewActivityTracker.DTOs.SessionRecording;

namespace AIInterviewActivityTracker.Interfaces;

/// <summary>
/// Contract for complete session recording upload, retrieval, streaming, and deletion operations.
/// </summary>
public interface ISessionRecordingService
{
    /// <summary>
    /// Uploads and persists the complete interview session recording.
    /// </summary>
    Task<SessionRecordingResponse> UploadAsync(UploadSessionRecordingRequest request);

    /// <summary>
    /// Retrieves the complete recording associated with a session.
    /// </summary>
    Task<SessionRecordingResponse?> GetBySessionIdAsync(string sessionId);

    /// <summary>
    /// Deletes a complete session recording.
    /// </summary>
    Task<bool> DeleteAsync(string recordingId);

    /// <summary>
    /// Opens a complete session recording for browser playback.
    /// </summary>
    Task<(Stream Stream, string ContentType, string FileName)>
        GetStreamAsync(string recordingId);
}