using AIInterviewActivityTracker.Database;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories;

/// <summary>
/// Provides MongoDB persistence operations for complete interview session recordings
/// </summary>
public class SessionRecordingRepository : ISessionRecordingRepository
{
    private readonly IMongoCollection<SessionRecording> _sessionRecordings;

    public SessionRecordingRepository(MongoDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var collectionName = context.Settings.SessionRecordingCollection;

        if (string.IsNullOrWhiteSpace(collectionName))
        {
            throw new InvalidOperationException(
                "Session recording collection name is not configured.");
        }

        _sessionRecordings =
            context.GetCollection<SessionRecording>(collectionName);
    }

    /// <summary>
    /// Persists a complete interview session recording in MongoDB.
    ///
    /// Input:
    /// recording - Session recording containing the interview session
    /// and recording metadata.
    ///
    /// Output:
    /// Returns the persisted session recording.
    /// </summary>
    
    public async Task<SessionRecording> CreateSessionRecordingAsync(SessionRecording recording)
    {
        ArgumentNullException.ThrowIfNull(recording);

        await _sessionRecordings.InsertOneAsync(recording);

        return recording;
    }

    /// <summary>
    /// Retrieves the complete session recording associated with a session.
    ///
    /// Input:
    /// sessionId - Unique identifier of the interview session.
    ///
    /// Output:
    /// Returns the matching session recording, or null when no recording exists.
    /// </summary>
    public async Task<SessionRecording?> GetBySessionIdAsync(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException(
                "Session ID cannot be null or empty.",
                nameof(sessionId));
        }

        return await _sessionRecordings
            .Find(recording => recording.SessionId == sessionId.Trim())
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Retrieves a session recording using its unique recording identifier.
    ///
    /// Input:
    /// recordingId - Unique identifier of the session recording.
    ///
    /// Output:
    /// Returns the matching session recording, or null when not found.
    /// </summary>
    public async Task<SessionRecording?> GetByIdAsync(
        string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID cannot be null or empty.",
                nameof(recordingId));
        }

        return await _sessionRecordings
            .Find(recording => recording.Id == recordingId.Trim())
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Deletes a complete session recording from MongoDB.
    ///
    /// Input:
    /// recordingId - Unique identifier of the session recording.
    ///
    /// Output:
    /// Returns true when a recording is successfully deleted;
    /// otherwise returns false.
    /// </summary>
    public async Task<bool> DeleteAsync(string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID cannot be null or empty.",
                nameof(recordingId));
        }

        var result = await _sessionRecordings.DeleteOneAsync(
            recording =>recording.Id == recordingId.Trim());

        return result.DeletedCount > 0;
    }
}