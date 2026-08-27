using AIInterviewActivityTracker.Configurations;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AIInterviewActivityTracker.Database
{
    /// <summary>
    /// Centralized Database Context using a Singleton MongoClient instance.
    /// Manages database access safely without spawning multiple connections.
    /// </summary>
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        /// <summary>
        /// Gets the strongly-typed MongoDB configuration settings.
        /// </summary>
        public MongoDbSettings Settings { get; }

        public MongoDbContext(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
        {
            // Defensive Null & Validation Checks
            ArgumentNullException.ThrowIfNull(mongoClient);
            ArgumentNullException.ThrowIfNull(settings);

            Settings = settings.Value ?? throw new ArgumentNullException(nameof(settings));

            if (string.IsNullOrWhiteSpace(Settings.DatabaseName))
            {
                throw new InvalidOperationException("MongoDB DatabaseName is missing in appsettings configuration.");
            }

            _database = mongoClient.GetDatabase(Settings.DatabaseName);
        }

        /// <summary>
        /// Retrieves a MongoDB collection instance for a specific model type.
        /// </summary>
        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            // Safe Whitespace Check
            if (string.IsNullOrWhiteSpace(collectionName))
            {
                throw new ArgumentException("Collection name cannot be null or empty.", nameof(collectionName));
            }

            return _database.GetCollection<T>(collectionName);
        }
    }
}