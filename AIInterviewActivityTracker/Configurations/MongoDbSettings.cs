namespace AIInterviewActivityTracker.Configurations
{
    /// <summary>
    /// Holds MongoDB connection configuration mappings from appsettings.
    /// </summary>
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string InterviewSessionCollection { get; set; } = string.Empty;
        public string ActivityEventsCollection { get; set; } = string.Empty;
        public string InterviewSummaryCollection { get; set; } = string.Empty;
        public string SessionRecordingCollection { get; set; } = string.Empty;
    }
}