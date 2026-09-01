using AIInterviewActivityTracker.Repositories;
using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories;

/// <summary>
/// Provides MongoDB persistence operations for interview recordings.
/// </summary>
public class RecordingRepository : IRecordingRepository
{
    private readonly IMongoCollection<Recording> _recordings;

    /// <summary>
    /// Initializes the recording repository using the centralized database context.
    /// </summary>
    public RecordingRepository(MongoDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        _recordings = context.GetCollection<Recording>("Recordings");
    }

    /// <summary>
    /// Persists recording metadata in MongoDB.
    /// </summary>
    public async Task<Recording> CreateRecordingAsync(
        Recording recording)
    {
        ArgumentNullException.ThrowIfNull(recording);
        await _recordings.InsertOneAsync(recording);

        return recording;
    }

    /// <summary>
    /// Retrieves all recordings associated with a session.
    /// </summary>
    public async Task<List<Recording>> GetRecordingsBySessionIdAsync(
        string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException(
                "Session ID cannot be null or empty.", nameof(sessionId));
        }

        return await _recordings
            .Find(recording => recording.SessionId == sessionId.Trim())
            .SortBy(recording => recording.QuestionNumber)
            .ToListAsync();
    }

    /// <summary>
    /// Retrieves a recording by its identifier.
    /// </summary>
    public async Task<Recording?> GetRecordingByIdAsync(
        string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID cannot be null or empty.",
                nameof(recordingId));
        }

        return await _recordings
            .Find(recording => recording.Id == recordingId.Trim())
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Deletes recording metadata by its identifier.
    /// </summary>
    public async Task<bool> DeleteRecordingAsync(
        string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID cannot be null or empty.", nameof(recordingId));
        }

        var result = await _recordings.DeleteOneAsync(
            recording => recording.Id == recordingId.Trim());

        return result.DeletedCount > 0;
    }
}