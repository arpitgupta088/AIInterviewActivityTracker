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

export const createInterviewSession = async (data) => {
  const response = await apiClient.post("/sessions", data);
  return response.data;
};

export const createActivityEvent = async (data) => {
  const response = await apiClient.post("/activities", data);
  return response.data;
};

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

  formData.append("SessionId", sessionId.trim());
  formData.append("CandidateId", candidateId.trim());
  formData.append("QuestionNumber", questionNumber.toString());
  formData.append("Recording", file);

  const response = await apiClient.post(
    "/recordings/upload",
    formData
  );

  return response.data;
};
