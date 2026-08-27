using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace AIInterviewActivityTracker.DTOs.Recording
{
    public class UploadRecordingRequest
    {
        [Required]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        public string CandidateId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int QuestionNumber { get; set; }

        [Required]
        public IFormFile Recording { get; set; } = null!;
    }
}
