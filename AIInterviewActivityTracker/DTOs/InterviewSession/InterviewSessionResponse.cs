namespace AIInterviewActivityTracker.DTOs.InterviewSession
{
    /// <summary>
    /// Standard output response DTO for Interview Session details.
    /// </summary>
    public class InterviewSessionResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string CandidateId { get; set; } = string.Empty;
        public string InterviewId { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}