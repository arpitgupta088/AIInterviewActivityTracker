import apiClient from "./apiClient";
import ActivityTracker from "./activityTracker";

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

/*
 * Retrieves a paginated list of interview sessions.
 *
 * Input:
 * - page: Current page number.
 * - pageSize: Number of sessions to retrieve per page.
 *
 * Output:
 * - Returns the paginated interview session response from the backend.
 */

export const getAllSessions = async (page = 1, pageSize = 10) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be greater than or equal to 1.");
  }

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new Error("Page size must be between 1 and 100.");
  }

  const response = await apiClient.get("/sessions", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
};

/**
 * Retrieves interview summary by Session ID.
 */
export const getInterviewSummary = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  const response = await apiClient.get(
    `/interview-summaries/${encodeURIComponent(sessionId.trim())}`
  );

  return response.data;
};

/**
 * Generates interview summary for a session.
 */
export const generateInterviewSummary = async (sessionId) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  const response = await apiClient.post(
    `/interview-summaries/generate/${encodeURIComponent(sessionId.trim())}`
  );

  return response.data;
};

/**
 * Creates a new candidate interview session.
 */
export const createInterviewSession = async (data) => {
  const response = await apiClient.post("/sessions", data);
  return response.data;
};

/**
 * Queues a single activity event for batched Beacon transmission.
 *
 * Input:
 * - data: Activity event containing session ID, candidate ID,
 *   event type, module, and metadata JSON.
 *
 * Output:
 * - Returns a Promise that resolves after the event is queued.
 */
export const createActivityEvent = async (data) => {
  if (!data) {
    throw new Error("Activity event data is required.");
  }

  if (!data.sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  if (!data.candidateId?.trim()) {
    throw new Error("Candidate ID is required.");
  }

  if (!data.eventType?.trim()) {
    throw new Error("Event type is required.");
  }

  ActivityTracker.trackEvent(
    data.sessionId,
    data.candidateId,
    data.eventType,
    data.module ?? "",
    data.metadataJson ?? "{}"
  );

  return {
    queued: true,
  };
};

/**
 * Updates the lifecycle status of an interview session.
 */
export const updateSessionStatus = async (data) => {
  const response = await apiClient.patch("/sessions/status", data);
  return response.data;
};

/**
 * Uploads a recorded interview response for a specific question.
 */
export const uploadRecording = async ({
  sessionId,
  candidateId,
  questionNumber,
  blob,
}) => {
  if (!sessionId?.trim()) {
    throw new Error("Session ID is required.");
  }

  if (!candidateId?.trim()) {
    throw new Error("Candidate ID is required.");
  }

  if (!Number.isInteger(questionNumber) || questionNumber <= 0) {
    throw new Error("Question number must be a positive integer.");
  }

  if (!(blob instanceof Blob) || blob.size <= 0) {
    throw new Error("A valid recording is required.");
  }

  const file = new File(
    [blob],
    `question-${questionNumber}.webm`,
    {
      type: blob.type || "video/webm",
    }
  );

  const formData = new FormData();

  formData.append("recording", file);

  const response = await apiClient.post(
    `/recordings/upload/${encodeURIComponent(sessionId.trim())}`,
    formData,
    {
      params: {
        candidateId: candidateId.trim(),
        questionNumber,
      },
    }
  );

  return response.data;
};
