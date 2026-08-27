using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces;

public interface ISessionRecordingRepository
{
    /// <summary>
    /// Persists complete session recording metadata.
    /// </summary>
    Task<SessionRecording> CreateSessionRecordingAsync(SessionRecording recording);

    /// <summary>
    /// Retrieves the session recording associated with a session.
    /// </summary>
    Task<SessionRecording?> GetBySessionIdAsync(string sessionId);

    /// <summary>
    /// Retrieves a session recording by its identifier.
    /// </summary>
    Task<SessionRecording?> GetByIdAsync(string recordingId);

    /// <summary>
    /// Deletes session recording metadata by its identifier.
    /// </summary>
    Task<bool> DeleteAsync(string recordingId);
}