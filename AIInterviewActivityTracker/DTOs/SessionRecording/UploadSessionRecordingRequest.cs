using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AIInterviewActivityTracker.DTOs.SessionRecording
{
    public class UploadSessionRecordingRequest
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        public string CandidateId { get; set; } = string.Empty;

        [Required]
        public IFormFile Recording { get; set; } = null!;

        [Required]
        public DateTime StartedAt { get; set; }

        public DateTime? EndedAt { get; set; }
    }
}

