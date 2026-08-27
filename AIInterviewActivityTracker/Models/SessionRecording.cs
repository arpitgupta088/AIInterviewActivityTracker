using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Represents the complete interview session recording and its persisted metadata.
    /// </summary>
    public class SessionRecording
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("sessionId")]
        public string SessionId { get; set; } = string.Empty;

        [BsonElement("candidateId")]
        public string CandidateId { get; set; } = string.Empty;

        [BsonElement("fileName")]
        public string FileName { get; set; } = string.Empty;

        [BsonElement("filePath")]
        public string FilePath { get; set; } = string.Empty;

        [BsonElement("contentType")]
        public string ContentType { get; set; } = string.Empty;

        [BsonElement("fileSize")]
        public long FileSize { get; set; }

        [BsonElement("startedAt")]
        public DateTime StartedAt { get; set; }

        [BsonElement("endedAt")]
        public DateTime? EndedAt { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
