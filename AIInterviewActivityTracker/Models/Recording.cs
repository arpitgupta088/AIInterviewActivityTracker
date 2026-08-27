using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AIInterviewActivityTracker.Models;

/// <summary>
/// Represents a per-question candidate webcam recording and its persisted metadata.
/// </summary>
public class Recording
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("sessionId")]
    public string SessionId { get; set; } = string.Empty;

    [BsonElement("candidateId")]
    public string CandidateId { get; set; } = string.Empty;

    [BsonElement("questionNumber")]
    public int QuestionNumber { get; set; }

    [BsonElement("fileName")]
    public string FileName { get; set; } = string.Empty;

    [BsonElement("filePath")]
    public string FilePath { get; set; } = string.Empty;

    [BsonElement("contentType")]
    public string ContentType { get; set; } = string.Empty;

    [BsonElement("fileSize")]
    public long FileSize { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}