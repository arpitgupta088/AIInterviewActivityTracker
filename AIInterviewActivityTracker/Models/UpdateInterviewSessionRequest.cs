namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Request payload for updating an existing interview session state.
    /// </summary>
    public class UpdateInterviewSessionRequest
    {
        public string SessionId { get; set; } = string.Empty;

        /// <summary>
        /// Status: IN_PROGRESS, COMPLETED, ABORTED
        /// </summary>
        public string Status { get; set; } = string.Empty;
    }
}