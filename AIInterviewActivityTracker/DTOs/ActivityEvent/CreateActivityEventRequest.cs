namespace AIInterviewActivityTracker.DTOs.ActivityEvent
{
    /// <summary>
    /// Request payload for capturing incoming Beacon API activity events.
    /// </summary>
    public class CreateActivityEventRequest
    {
        public string SessionId { get; set; } = string.Empty;
        public string CandidateId { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string MetadataJson { get; set; } = "{}";
    }
}