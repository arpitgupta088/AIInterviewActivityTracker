using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Services;

/// <summary>
/// Handles storage and persistence of complete interview session recordings.
/// </summary>
public class SessionRecordingService : ISessionRecordingService
{
    private const long MaxFileSize = 500 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "video/webm",
            "video/mp4"
        };

    private readonly ISessionRecordingRepository _repository; 
    private readonly IWebHostEnvironment _environment;

    public SessionRecordingService(
        ISessionRecordingRepository repository,IWebHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(repository);
        ArgumentNullException.ThrowIfNull(environment);

        _repository = repository;
        _environment = environment;
    }

    /// <summary>
    /// Uploads and persists the complete interview session recording.
    ///
    /// Input:
    /// request - Multipart session recording upload request containing
    /// session and recording metadata.
    ///
    /// Output:
    /// Returns the persisted session recording.
    /// </summary>
    public async Task<SessionRecording> UploadAsync(
        string sessionId,
        string candidateId,
        IFormFile recording,
        DateTime startedAt,
        DateTime? endedAt)
    {

        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException(
                "Session ID is required.",
                nameof(sessionId));
        }

        if (string.IsNullOrWhiteSpace(candidateId))
        {
            throw new ArgumentException(
                "Candidate ID is required.",
                nameof(candidateId));
        }

        ArgumentNullException.ThrowIfNull(recording);

        if (recording.Length <= 0)
        {
            throw new ArgumentException(
                "Recording file cannot be empty.",
                nameof(recording));
        }

        if (recording.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "Session recording exceeds the allowed file size.",
                nameof(recording));
        }

        var normalizedContentType = recording.ContentType?
        .Split(';', StringSplitOptions.RemoveEmptyEntries)[0]
        .Trim()
        .ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedContentType))
        {
            throw new ArgumentException(
                "Recording content type is required.",
                nameof(recording));
        }

        if (!AllowedContentTypes.Contains(normalizedContentType))
        {
            throw new ArgumentException(
                "Unsupported session recording format.",
                nameof(recording));
        }

        if (endedAt.HasValue &&
            endedAt.Value < startedAt)
        {
            throw new ArgumentException(
                "Recording end time cannot be earlier than start time.",
                nameof(endedAt));
        }

        var recordingsDirectory = Path.Combine(
            _environment.WebRootPath ??
            Path.Combine(
                _environment.ContentRootPath,
                "wwwroot"),"uploads","session-recordings");

        Directory.CreateDirectory(recordingsDirectory);

        var extension = normalizedContentType.Equals(
                "video/mp4",
                StringComparison.OrdinalIgnoreCase)
            ? ".mp4"
            : ".webm";

        var fileName = $"{Guid.NewGuid():N}{extension}";

        var physicalFilePath = Path.Combine(
            recordingsDirectory,
            fileName);

        var relativeFilePath = Path.Combine(
            "uploads",
            "session-recordings",
            fileName)
            .Replace('\\', '/');

        try
        {
            await using var fileStream = new FileStream(
                physicalFilePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true);

            await recording.CopyToAsync(fileStream);

            var sessionRecording = new SessionRecording
            {
                SessionId = sessionId.Trim(),
                CandidateId = candidateId.Trim(),
                FileName = fileName,
                FilePath = relativeFilePath,
                ContentType = normalizedContentType,
                FileSize = recording.Length,
                StartedAt = startedAt,
                EndedAt = endedAt,
                CreatedAt = DateTime.UtcNow
            };

            var createdRecording = await _repository.CreateSessionRecordingAsync(sessionRecording);

            return createdRecording;
        }
        catch
        {
            if (File.Exists(physicalFilePath))
            {
                File.Delete(physicalFilePath);
            }

            throw;
        }
    }

    /// <summary>
    /// Retrieves the complete recording metadata for an interview session.
    ///
    /// Input:
    /// sessionId - Unique identifier of the interview session.
    ///
    /// Output:
    /// Returns the session recording, or null when no recording exists.
    /// </summary>
    public async Task<SessionRecording?> GetBySessionIdAsync(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException(
                "Session ID is required.",
                nameof(sessionId));
        }

        var recording =
            await _repository.GetBySessionIdAsync(sessionId.Trim());

        return recording;
    }

    /// <summary>
    /// Opens a complete session recording for browser playback.
    ///
    /// Input:
    /// recordingId - Unique identifier of the session recording.
    ///
    /// Output:
    /// Returns the recording stream, content type, and file name.
    /// </summary>
    public async Task<(Stream Stream, string ContentType, string FileName)>GetStreamAsync(string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID is required.",
                nameof(recordingId));
        }

        var recording = await _repository.GetByIdAsync(recordingId.Trim());

        if (recording is null)
        {
            throw new KeyNotFoundException(
                $"Session recording '{recordingId.Trim()}' was not found.");
        }

        var physicalFilePath = GetPhysicalFilePath(recording.FilePath);

        if (!File.Exists(physicalFilePath))
        {
            throw new FileNotFoundException(
                "Session recording file was not found.",
                physicalFilePath);
        }

        var stream = new FileStream(
            physicalFilePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            bufferSize: 81920,
            useAsync: true);

        return (
            stream,
            recording.ContentType,
            recording.FileName
        );
    }

    /// <summary>
    /// Deletes a complete session recording and its physical file.
    ///
    /// Input:
    /// recordingId - Unique identifier of the session recording.
    ///
    /// Output:
    /// Returns true when the recording is successfully deleted; otherwise false.
    /// </summary>
    public async Task<bool> DeleteAsync(string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID is required.",
                nameof(recordingId));
        }

        var normalizedId = recordingId.Trim();

        var recording =
            await _repository.GetByIdAsync(normalizedId);

        if (recording is null)
        {
            return false;
        }

        var deleted =
            await _repository.DeleteAsync(normalizedId);

        if (!deleted)
        {
            return false;
        }

        var physicalFilePath = GetPhysicalFilePath(recording.FilePath);

        if (File.Exists(physicalFilePath))
        {
            File.Delete(physicalFilePath);
        }

        return true;
    }

    private string GetPhysicalFilePath(string relativeFilePath)
    {
        if (string.IsNullOrWhiteSpace(relativeFilePath))
        {
            throw new InvalidOperationException(
                "Session recording file path is missing.");
        }

        var normalizedPath = relativeFilePath
            .Replace(
                '/',
                Path.DirectorySeparatorChar)
            .Replace(
                '\\',
                Path.DirectorySeparatorChar);

        var webRootPath =
            _environment.WebRootPath ??
            Path.Combine(
                _environment.ContentRootPath,
                "wwwroot");

        var fullPath = Path.GetFullPath(
            Path.Combine(
                webRootPath,
                normalizedPath));

        var recordingsRoot = Path.GetFullPath(
            Path.Combine(
                webRootPath,
                "uploads",
                "session-recordings"));

        var recordingsRootWithSeparator =
            recordingsRoot.EndsWith(
                Path.DirectorySeparatorChar)
                ? recordingsRoot
                : recordingsRoot +
                  Path.DirectorySeparatorChar;

        if (!fullPath.StartsWith(
                recordingsRootWithSeparator,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Invalid session recording file path.");
        }

        return fullPath;
    }
}