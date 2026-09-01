using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Represents a raw browser/client activity event log captured via Beacon API.
    /// Stores client lifecycle actions and hardware permission statuses.
    /// </summary>
    public class ActivityEvent
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("sessionId")]
        public string SessionId { get; set; } = string.Empty;

        [BsonElement("candidateId")]
        public string CandidateId { get; set; } = string.Empty;

        /// <summary>
        /// Event types: MIC_TOGGLED, TAB_HIDDEN, BEACON_UNLOAD, NETWORK_OFFLINE, etc
        /// </summary>
        [BsonElement("eventType")]
        public string EventType { get; set; } = string.Empty;

        /// <summary>
        /// Module name: AUDIO_RECORDER, PERMISSION_CHECKER, BROWSER_LIFECYCLE, etc.
        /// </summary>
        [BsonElement("module")]
        public string Module { get; set; } = string.Empty;

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [BsonElement("sequenceNumber")]
        public long SequenceNumber { get; set; }

        [BsonElement("metadataJson")]
        public string MetadataJson { get; set; } = "{}";

        [BsonElement("ipAddress")]
        public string? IpAddress { get; set; }

        [BsonElement("userAgent")]
        public string? UserAgent { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
