using AIInterviewActivityTracker.Configurations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Repositories
{
    /// <summary>
    /// Creates required MongoDB indexes during application startup.
    /// </summary>
    public static class MongoDbIndexes
    {
        public static async Task CreateIndexesAsync(IServiceProvider serviceProvider)
        {
            ArgumentNullException.ThrowIfNull(serviceProvider);

            using var scope = serviceProvider.CreateScope();

            var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
            var settings = scope.ServiceProvider
                .GetRequiredService<IOptions<MongoDbSettings>>()
                .Value;

            // ActivityEvents Collection
            var activityCollection =
                dbContext.GetCollection<Models.ActivityEvent>(
                    settings.ActivityEventsCollection);

            // SessionId Index
            await activityCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.ActivityEvent>(
                    Builders<Models.ActivityEvent>.IndexKeys
                        .Ascending(x => x.SessionId)));

            // EventType Index
            await activityCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.ActivityEvent>(
                    Builders<Models.ActivityEvent>.IndexKeys
                        .Ascending(x => x.EventType)));

            // Timestamp Descending Index
            await activityCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.ActivityEvent>(
                    Builders<Models.ActivityEvent>.IndexKeys
                        .Descending(x => x.Timestamp)));

            // TTL Index (30 Days)
            await activityCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.ActivityEvent>(
                    Builders<Models.ActivityEvent>.IndexKeys
                        .Ascending(x => x.CreatedAt),
                    new CreateIndexOptions
                    {
                        Name = "TTL_ActivityEvents",
                        ExpireAfter = TimeSpan.FromDays(30)
                    }));

            await activityCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.ActivityEvent>(
                    Builders<Models.ActivityEvent>.IndexKeys
                        .Ascending(x => x.SessionId)
                        .Descending(x => x.Timestamp),
                    new CreateIndexOptions
                    {
                        Name = "IX_SessionId_Timestamp"
                    }));

            // SessionRecordings Collection
            var sessionRecordingCollection =
                dbContext.GetCollection<Models.SessionRecording>(
                    settings.SessionRecordingCollection);

            await sessionRecordingCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.SessionRecording>(
                    Builders<Models.SessionRecording>.IndexKeys
                        .Ascending(x => x.SessionId),
                    new CreateIndexOptions
                    {
                        Name = "IX_SessionRecordings_SessionId"
                    }));

            await sessionRecordingCollection.Indexes.CreateOneAsync(
                new CreateIndexModel<Models.SessionRecording>(
                    Builders<Models.SessionRecording>.IndexKeys
                        .Descending(x => x.CreatedAt),
                    new CreateIndexOptions
                    {
                        Name = "IX_SessionRecordings_CreatedAt"
                    }));
        }
    }
}