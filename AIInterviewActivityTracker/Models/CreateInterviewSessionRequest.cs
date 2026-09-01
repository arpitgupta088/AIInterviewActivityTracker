namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Request payload for creating a new interview session tracking entry.
    /// </summary>
    public class CreateInterviewSessionRequest
    {
        public string SessionId { get; set; } = string.Empty;

        public string CandidateId { get; set; } = string.Empty;

        public string InterviewId { get; set; } = string.Empty;
    }
}