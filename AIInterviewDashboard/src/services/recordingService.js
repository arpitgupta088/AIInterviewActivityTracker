import apiClient from "./apiClient";

/**
 * Centralized recording service.
 *
 * Handles:
 * - Browser MediaRecorder operations
 * - MediaStream lifecycle
 * - Recording API communication
 */
class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
  }

  setStream(stream) {
    if (!stream) {
      throw new Error("Media stream is required.");
    }

    this.stream = stream;
  }

  getStream() {
    return this.stream;
  }

  startRecording() {
    if (!this.stream) {
      throw new Error("Media stream is not available.");
    }

    if (this.mediaRecorder?.state === "recording") {
      throw new Error("Recording is already in progress.");
    }

    this.recordedChunks = [];

    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(1000);
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("Recording has not started."));
        return;
      }

      const recorder = this.mediaRecorder;

      recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: "video/webm",
        });

        this.mediaRecorder = null;
        this.recordedChunks = [];

        resolve(blob);
      };

      recorder.stop();
    });
  }

  stopStream() {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach((track) => {
      track.stop();
    });

    this.stream = null;
  }

  cleanup() {
    const recorder = this.mediaRecorder;
    if (recorder?.state === "recording") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stopStream();
  }

  hasStream() {
    return this.stream !== null;
  }

  /**
   * Retrieves all recordings associated with a session.
   */
  async getRecordingsBySessionId(sessionId) {
    if (!sessionId?.trim()) {
      throw new Error("Session ID is required.");
    }

    const response = await apiClient.get(
      `/recordings/session/${encodeURIComponent(sessionId.trim())}`
    );

    return response.data?.data ?? [];
  }

  /**
   * Builds the streaming URL for a recording.
   */
  getRecordingStreamUrl(recordingId) {
    if (!recordingId?.trim()) {
      throw new Error("Recording ID is required.");
    }

    return (
      `${apiClient.defaults.baseURL}/recordings/` +
      `${encodeURIComponent(recordingId.trim())}/stream`
    );
  }

  /**
   * Deletes a recording and its physical file.
   */
  async deleteRecording(recordingId) {
    if (!recordingId?.trim()) {
      throw new Error("Recording ID is required.");
    }

    const response = await apiClient.delete(
      `/recordings/${encodeURIComponent(recordingId.trim())}`
    );

    return response.data;
  }
}

const recordingService = new RecordingService();

export default recordingService;