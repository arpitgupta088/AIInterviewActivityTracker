using AIInterviewActivityTracker.DTOs.Recording;

namespace AIInterviewActivityTracker.Interfaces;

/// <summary>
/// Contract for recording upload, retrieval, streaming, and deletion operations.
/// </summary>
public interface IRecordingService
{
    /// <summary>
    /// Uploads and persists a recording for an interview session.
    /// </summary>
    Task<RecordingResponse> UploadRecordingAsync(
        string sessionId,
        UploadRecordingRequest request);

    /// <summary>
    /// Retrieves all recordings associated with a session.
    /// </summary>
    Task<List<RecordingResponse>> GetRecordingsBySessionIdAsync(
        string sessionId);

    /// <summary>
    /// Deletes a recording associated with its identifier.
    /// </summary>
    Task<bool> DeleteRecordingAsync(string recordingId);

    /// <summary>
    /// Opens a recording file for browser playback.
    /// </summary>
    Task<(Stream Stream, string ContentType, string FileName)>
        GetRecordingStreamAsync(string recordingId);
}