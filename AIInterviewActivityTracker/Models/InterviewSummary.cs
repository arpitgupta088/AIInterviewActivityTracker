using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Represents a processed session timeline summary used by Support Engineers.
    /// Aggregates event counts, session anomalies, and status notes.
    /// </summary>
    public class InterviewSummary
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("sessionId")]
        public string SessionId { get; set; } = string.Empty;

        [BsonElement("candidateId")]
        public string CandidateId { get; set; } = string.Empty;

        [BsonElement("totalEventsCount")]
        public int TotalEventsCount { get; set; } = 0;

        [BsonElement("errorEventsCount")]         /// checks suspicioius activities
        public int ErrorEventsCount { get; set; } = 0;

        [BsonElement("isAbortedByCandidate")]
        public bool IsAbortedByCandidate { get; set; } = false;

        [BsonElement("lastActiveTimestamp")]
        public DateTime LastActiveTimestamp { get; set; } = DateTime.UtcNow;

        [BsonElement("summaryNotes")]
        public string SummaryNotes { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }
}