import apiClient from "./apiClient";

/**
 * Retrieves aggregated dashboard statistics.
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get("/dashboard/stats");
  return response.data;
};

/**
 * Retrieves the most recent activity events.
 */
export const getRecentEvents = async (limit = 10) => {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100.");
  }

  const response = await apiClient.get("/dashboard/recent-events", {
    params: { limit },
  });

  return response.data;
};

/**
 * Retrives the complete activity timeline for a session.
 */
export const getSessionTimeline = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }
  const response = await apiClient.get(`/dashboard/timeline/${encodeURIComponent(sessionId.trim())}`);
  return response.data;
};

const dashboardService = {
  getDashboardStats,
  getRecentEvents,
  getSessionTimeline,
};

export default dashboardService;