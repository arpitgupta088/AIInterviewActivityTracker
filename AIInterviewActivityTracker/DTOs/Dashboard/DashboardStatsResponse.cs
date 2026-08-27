namespace AIInterviewActivityTracker.DTOs.Dashboard
{

    /// <summary>
    /// Represents aggregated interview session statistics for the dashboard
    /// </summary>
    public class DashboardStatsResponse
    {
        public long TotalSessions { get; set; }

        public long ActiveSessions { get; set; }

        public long TotalEvents { get; set; }
    }
}
