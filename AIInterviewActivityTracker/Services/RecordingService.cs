using AIInterviewActivityTracker.Interfaces;
using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Services;

public class RecordingService : IRecordingService
{
    private const long MaxFileSize = 100 * 1024 * 1024;

    private static readonly HashSet<string> AllowedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "video/webm",
            "video/mp4"
        };

    private readonly IRecordingRepository _recordingRepository;
    private readonly IWebHostEnvironment _environment;

    public RecordingService(
        IRecordingRepository recordingRepository,
        IWebHostEnvironment environment)
    {
        ArgumentNullException.ThrowIfNull(recordingRepository);
        ArgumentNullException.ThrowIfNull(environment);

        _recordingRepository = recordingRepository;
        _environment = environment;
    }

    /// <summary>
    /// Uploads a recording, stores the physical file, and persists its metadata.
    /// </summary>
    public async Task<Recording> UploadRecordingAsync(
        string sessionId,
        string candidateId,
        int questionNumber,
        IFormFile recording)
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

        if (questionNumber <= 0)
        {
            throw new ArgumentException(
                "Question number must be greater than zero.",
                nameof(questionNumber));
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
                "Recording file size exceeds the allowed limit.",
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
                "Unsupported recording format.",
                nameof(recording));
        }

        var recordingsDirectory = Path.Combine(
            _environment.WebRootPath ?? Path.Combine(
                _environment.ContentRootPath,
                "wwwroot"),
            "uploads",
            "recordings");

        Directory.CreateDirectory(recordingsDirectory);

        var extension = normalizedContentType
            .Equals("video/mp4", StringComparison.OrdinalIgnoreCase)
            ? ".mp4"
            : ".webm";

        var fileName = $"{Guid.NewGuid():N}{extension}";

        var physicalFilePath = Path.Combine(
            recordingsDirectory,
            fileName);

        var relativeFilePath = Path.Combine(
            "uploads",
            "recordings",
            fileName)
            .Replace('\\', '/');

        try
        {
            await using (var fileStream = new FileStream(
                physicalFilePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true))

            {
                await recording.CopyToAsync(fileStream);
            }

            var recordingEntity = new Recording
            {
                SessionId = sessionId.Trim(),
                CandidateId = candidateId.Trim(),
                QuestionNumber = questionNumber,
                FileName = fileName,
                FilePath = relativeFilePath,
                ContentType = normalizedContentType,
                FileSize = recording.Length,
                CreatedAt = DateTime.UtcNow
            };

            var createdRecording =
                await _recordingRepository.CreateRecordingAsync(recordingEntity);

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
    /// Retrieves all recordings associated with an interview session.
    /// </summary>
    public async Task<List<Recording>> GetRecordingsBySessionIdAsync(
        string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException("Session ID is required.", nameof(sessionId));
        }

        var recordings =
            await _recordingRepository.GetRecordingsBySessionIdAsync(
                sessionId.Trim());

        return recordings;
    }

    /// <summary>
    /// Opens a recording file for browser playback.
    /// </summary>
    public async Task<(Stream Stream, string ContentType, string FileName)>
        GetRecordingStreamAsync(string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException(
                "Recording ID is required.",
                nameof(recordingId));
        }

        var normalizedRecordingId = recordingId.Trim();

        var recording =
            await _recordingRepository.GetRecordingByIdAsync(
                normalizedRecordingId);

        if (recording is null)
        {
            throw new KeyNotFoundException(
                $"Recording '{normalizedRecordingId}' was not found.");
        }

        var physicalFilePath =
            GetPhysicalFilePath(recording.FilePath);

        if (!File.Exists(physicalFilePath))
        {
            throw new FileNotFoundException(
                "Recording file was not found.",
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
    /// Deletes a recording and its associated physical file.
    /// </summary>
    public async Task<bool> DeleteRecordingAsync(string recordingId)
    {
        if (string.IsNullOrWhiteSpace(recordingId))
        {
            throw new ArgumentException("Recording ID is required.", nameof(recordingId));
        }

        var recording =
            await _recordingRepository.GetRecordingByIdAsync(
                recordingId.Trim());

        if (recording is null)
        {
            return false;
        }

        var deleted =
            await _recordingRepository.DeleteRecordingAsync(
                recordingId.Trim());

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
            throw new InvalidOperationException("Recording file path is missing.");
        }

        var normalizedPath = relativeFilePath
            .Replace('/', Path.DirectorySeparatorChar)
            .Replace('\\', Path.DirectorySeparatorChar);

        var webRootPath = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        var fullPath = Path.GetFullPath(
            Path.Combine(webRootPath, normalizedPath));

        var recordingsRoot = Path.GetFullPath(
            Path.Combine(webRootPath, "uploads", "recordings"));

        var recordingsRootWithSeperator = recordingsRoot.EndsWith(
            Path.DirectorySeparatorChar)
            ? recordingsRoot : recordingsRoot + Path.DirectorySeparatorChar;

        if (!fullPath.StartsWith(
                recordingsRootWithSeperator,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid recording file path.");
        }

        return fullPath;
    }
}