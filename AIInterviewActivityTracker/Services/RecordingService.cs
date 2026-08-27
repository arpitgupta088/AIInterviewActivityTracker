using AIInterviewActivityTracker.DTOs.Recording;
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
    public async Task<RecordingResponse> UploadRecordingAsync(
        string sessionId,
        UploadRecordingRequest request)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException(
                "Session ID is required.",
                nameof(sessionId));
        }

        ArgumentNullException.ThrowIfNull(request);

        if (!string.Equals(
                sessionId.Trim(),
                request.SessionId?.Trim(),
                StringComparison.Ordinal))
        {
            throw new ArgumentException(
                "Session ID does not match the request.",
                nameof(request));
        }

        if (string.IsNullOrWhiteSpace(request.CandidateId))
        {
            throw new ArgumentException(
                "Candidate ID is required.",
                nameof(request));
        }

        if (request.QuestionNumber <= 0)
        {
            throw new ArgumentException(
                "Question number must be greater than zero.",
                nameof(request));
        }

        ArgumentNullException.ThrowIfNull(request.Recording);

        if (request.Recording.Length <= 0)
        {
            throw new ArgumentException(
                "Recording file cannot be empty.",
                nameof(request));
        }

        if (request.Recording.Length > MaxFileSize)
        {
            throw new ArgumentException(
                "Recording file size exceeds the allowed limit.",
                nameof(request));
        }

        if (!AllowedContentTypes.Contains(request.Recording.ContentType))
        {
            throw new ArgumentException("Unsupported recording format.",
                nameof(request));
        }

        var recordingsDirectory = Path.Combine(
            _environment.WebRootPath ?? Path.Combine(
                _environment.ContentRootPath,
                "wwwroot"),
            "uploads",
            "recordings");

        Directory.CreateDirectory(recordingsDirectory);

        var extension = request.Recording.ContentType
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
                await request.Recording.CopyToAsync(fileStream);
            }

            var recording = new Recording
            {
                SessionId = sessionId.Trim(),
                CandidateId = request.CandidateId.Trim(),
                QuestionNumber = request.QuestionNumber,
                FileName = fileName,
                FilePath = relativeFilePath,
                ContentType = request.Recording.ContentType.Trim(),
                FileSize = request.Recording.Length,
                CreatedAt = DateTime.UtcNow
            };

            var createdRecording =
                await _recordingRepository.CreateRecordingAsync(recording);

            return MapToResponse(createdRecording);
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
    public async Task<List<RecordingResponse>> GetRecordingsBySessionIdAsync(
        string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new ArgumentException("Session ID is required.", nameof(sessionId));
        }

        var recordings =
            await _recordingRepository.GetRecordingsBySessionIdAsync(
                sessionId.Trim());

        return recordings
            .Select(MapToResponse)
            .ToList();
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
                recordingsRoot,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid recording file path.");
        }

        return fullPath;
    }

    private static RecordingResponse MapToResponse(
        Recording recording)
    {
        ArgumentNullException.ThrowIfNull(recording);

        return new RecordingResponse
        {
            Id = recording.Id,
            SessionId = recording.SessionId,
            CandidateId = recording.CandidateId,
            QuestionNumber = recording.QuestionNumber,
            FileName = recording.FileName,
            FilePath = recording.FilePath,
            ContentType = recording.ContentType,
            FileSize = recording.FileSize,
            CreatedAt = recording.CreatedAt
        };
    }
}