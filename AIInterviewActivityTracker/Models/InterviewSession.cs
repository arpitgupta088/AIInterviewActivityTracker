using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Represents a candidate interview session stored in MongoDB.
    /// Stores metadata regarding session lifecycle and status
    /// </summary>
    public class InterviewSession
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("sessionId")]
        public string SessionId { get; set; } = string.Empty;

        [BsonElement("candidateId")]
        public string CandidateId { get; set; } = string.Empty;

        [BsonElement("interviewId")]
        public string InterviewId { get; set; } = string.Empty;

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; } = DateTime.UtcNow;

        [BsonElement("endTime")]
        public DateTime? EndTime { get; set; }

        /// <summary>
        /// Status: IN_PROGRESS, COMPLETED, ABORTED
        /// </summary>
        [BsonElement("status")]
        public string Status { get; set; } = "IN_PROGRESS";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime? UpdatedAt { get; set; }
    }
}