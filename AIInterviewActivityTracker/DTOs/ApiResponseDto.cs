namespace AIInterviewActivityTracker.DTOs
{
    /// <summary>
    /// Standard API response wrapper used across all application endpoints.
    /// Ensures a consistent JSON response structure.
    /// </summary>
    /// <typeparam name="T">Type of the response payload.</typeparam>
    public class ApiResponseDto<T>
    {
        /// <summary>
        /// Indicates whether the request was processed successfully.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Response message describing the operation result.
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Response payload.
        /// </summary>
        public T? Data { get; set; }

        /// <summary>
        /// UTC timestamp when the response was generated.
        /// </summary>
        public DateTime Timestamp { get; init; } = DateTime.UtcNow;

        /// <summary>
        /// Creates a successful API response.
        /// </summary>
        /// <param name="data">Response payload.</param>
        /// <param name="message">Success message.</param>
        /// <returns>A successful API response.</returns>
        public static ApiResponseDto<T> CreateSuccess(
            T data,
            string message = "Request processed successfully.")
        {
            return new ApiResponseDto<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        /// <summary>
        /// Creates a failed API response.
        /// </summary>
        /// <param name="message">Failure message.</param>
        /// <returns>A failed API response.</returns>
        public static ApiResponseDto<T> CreateFailure(string message)
        {
            return new ApiResponseDto<T>
            {
                Success = false,
                Message = message
            };
        }
    }
}