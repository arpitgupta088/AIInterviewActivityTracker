using AIInterviewActivityTracker.Models;
using Microsoft.AspNetCore.Http;

namespace AIInterviewActivityTracker.Interfaces;

/// <summary>
/// Contract for recording upload, retrieval, streaming, and deletion operations.
/// </summary>
public interface IRecordingService
{
    /// <summary>
    /// Uploads and persists a recording for an interview session.
    /// </summary>
    Task<Recording> UploadRecordingAsync(
        string sessionId,
        string candidateId,
        int questionNumber,
        IFormFile recording);

    /// <summary>
    /// Retrieves all recordings associated with a session.
    /// </summary>
    Task<List<Recording>> GetRecordingsBySessionIdAsync(
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