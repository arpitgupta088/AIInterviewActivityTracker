namespace AIInterviewActivityTracker.DTOs.ActivityEvent
{
    /// <summary>
    /// Standard output response DTO for retrieved activity events.
    /// </summary>
    public class ActivityEventResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string CandidateId { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string MetadataJson { get; set; } = "{}";
    }
}