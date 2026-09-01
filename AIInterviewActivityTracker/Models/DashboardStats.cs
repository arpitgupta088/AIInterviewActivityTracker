namespace AIInterviewActivityTracker.Models
{
    /// <summary>
    /// Represents aggregated statistics required for the dashboard.
    /// </summary>
    public class DashboardStats
    {
        public long TotalSessions { get; set; }

        public long ActiveSessions { get; set; }

        public long TotalEvents { get; set; }
    }
}