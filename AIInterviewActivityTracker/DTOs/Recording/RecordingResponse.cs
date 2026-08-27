namespace AIInterviewActivityTracker.DTOs.Recording
{
    public class RecordingResponse
    {
        public string Id { get; set; } = string.Empty;

        public string SessionId { get; set; } = string.Empty;

        public string CandidateId { get; set; } = string.Empty;

        public int QuestionNumber { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FilePath { get; set; } = string.Empty;

        public string ContentType { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
