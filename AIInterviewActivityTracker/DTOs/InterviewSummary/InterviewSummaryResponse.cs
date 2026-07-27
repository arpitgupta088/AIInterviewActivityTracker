namespace AIInterviewActivityTracker.DTOs.InterviewSummary
{
    /// <summary>
    /// Output DTO representing candidate session timeline summary for Support Engineers.
    /// </summary>
    public class InterviewSummaryResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string CandidateId { get; set; } = string.Empty;
        public int TotalEventsCount { get; set; }
        public int ErrorEventsCount { get; set; }
        public bool IsAbortedByCandidate { get; set; }
        public DateTime LastActiveTimestamp { get; set; }
        public string SummaryNotes { get; set; } = string.Empty;
    }
}