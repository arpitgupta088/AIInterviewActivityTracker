import apiClient from "./apiClient";

/**
 * Retrieves an interview session by its Session ID.
 */
export const getSessionById = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  const response = await apiClient.get(
    `/sessions/${encodeURIComponent(sessionId.trim())}`
  );

  return response.data;
};

/**
 * Retrieves activity events belonging to a specific interview session.
 */
export const getSessionEvents = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  const response = await apiClient.get(
    `/activities/session/${encodeURIComponent(sessionId.trim())}`
  );

  return response.data;
};

/**
 * Retrives paginated and filtered activity events
 */
export const searchEvents = async (params) => {
  // params can include: page, pageSize, sessionId, eventType, startDate, endDate
  const response = await apiClient.get("/activities/search", { params });
  return response.data;
};

/**
 * Retrieves all Interview Sessions.
 */
export const getAllSessions = async () => {
  const response = await apiClient.get("/sessions");
  return response.data;
}