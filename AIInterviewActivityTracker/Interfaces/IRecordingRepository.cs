using AIInterviewActivityTracker.Models;

namespace AIInterviewActivityTracker.Interfaces
{
    public interface IRecordingRepository
    {
        /// <summary>
        /// Persists a recording metedata document.
        /// </summary>
        Task<Recording> CreateRecordingAsync(Recording recording);

        ///<summary>
        /// Retrives all recordings assosciated with a session
        /// </summary>
        Task<List<Recording>> GetRecordingsBySessionIdAsync(string sessionId);

        /// <summary>
        /// Retrieves a recording by its identifier
        /// </summary>
        /// 
        Task<Recording?> GetRecordingByIdAsync(string recordingId);

        /// <summary>
        /// Deletes a recording metadata document.
        /// </summary>
        Task<bool> DeleteRecordingAsync(string recordingId);
    }
}
