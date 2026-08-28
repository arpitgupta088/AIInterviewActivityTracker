import axios from "axios";

/**
 * Central Axios client used for communication with the backend API.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

/**
 * Sends batched activity events using the Browser Beacon API.
 *
 * Input:
 * - events: Array of activity event objects.
 *
 * Output:
 * - Returns true when the Beacon request is queued successfully;
 *   otherwise returns false.
 */
apiClient.sendBeaconBatch = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    console.warn("[ApiClient] No events available for Beacon.");
    return true;
  }

  const beaconUrl =
    `${apiClient.defaults.baseURL}/activities/beacon-batch`;

  try {
    const formData = new FormData();

    formData.append(
      "events",
      JSON.stringify(events)
    );

    const queued = navigator.sendBeacon(
      beaconUrl,
      formData
    );

    return queued;
  } catch (error) {
    console.error(
      "[ApiClient] Beacon API failed:",
      error
    );

    return false;
  }
};

export default apiClient;