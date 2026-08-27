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
  /**
   * Initialises the recording service state.
   */
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.sessionMediaRecorder = null;
    this.sessionRecordedChunks = [];
    this.sessionStream = null;
    this.sessionStartedAt = null;
    this.sessionStopping = false;
    this.sessionStoppedResult = null;
    this.onScreenShareEnded = null;
    this.screenShareEnded = false;
  }

  /**
   * Registers the callback invoked when screen sharing ends.
   * Immediately invokes the handler if screen sharing has already ended.
   *
   * Input:
   * - handler: Function to call when screen sharing ends, or null to clear.
   *
   * Output:
   * - Sets the onScreenShareEnded callback.
   */
  setScreenShareEndedHandler(handler) {
    this.onScreenShareEnded =
      typeof handler === "function"
        ? handler
        : null;

    if (this.screenShareEnded && this.onScreenShareEnded) {
      this.onScreenShareEnded();
    }
  }

  /**
   * Stores the candidate media stream for webcam recording.
   *
   * Input:
   * - stream: MediaStream from getUserMedia.
   *
   * Output:
   * - Sets the internal stream reference.
   */
  setStream(stream) {
    if (!stream) {
      throw new Error("Media stream is required.");
    }

    this.stream = stream;
  }

  /**
   * Returns the currently stored candidate media stream.
   *
   * Output:
   * - Returns the stored MediaStream, or null if not set.
   */
  getStream() {
    return this.stream;
  }

  /**
   * Starts recording the interview session using the display and microphone streams.
   *
   * Input:
   * - displayStream: MediaStream from getDisplayMedia (screen share).
   * - microphoneStream: Optional MediaStream providing the audio track.
   *
   * Output:
   * - Starts the session MediaRecorder and registers the screen share ended handler.
   */
  startSessionRecording(displayStream, microphoneStream) {
    if (!displayStream) {
      throw new Error("Display stream is required.");
    }

    if (
      this.sessionMediaRecorder?.state === "recording"
    ) {
      throw new Error(
        "Session recording is already in progress."
      );
    }

    this.sessionStopping = false;
    this.sessionStoppedResult = null;
    this.screenShareEnded = false;

    const displayVideoTrack = displayStream.getVideoTracks()[0];

    if (!displayVideoTrack) {
      throw new Error(
        "Display video track is not available."
      );
    }

    const tracks = [displayVideoTrack];

    const microphoneTrack = microphoneStream?.getAudioTracks()?.[0];

    if (microphoneTrack) {
      tracks.push(microphoneTrack);
    }

    this.sessionStream = new MediaStream(tracks);
    this.sessionRecordedChunks = [];
    this.sessionStartedAt = new Date();

    this.sessionMediaRecorder =
      new MediaRecorder(this.sessionStream);

    this.sessionMediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.sessionRecordedChunks.push(
          event.data
        );
      }
    };

    this.sessionMediaRecorder.start(1000);

    displayVideoTrack.addEventListener(
      "ended",
      () => {
        this.screenShareEnded = true;

        if (this.onScreenShareEnded) {
          this.onScreenShareEnded();
        }
      },
      { once: true }
    );

  }

  /**
   * Stops the session recording and returns the recorded blob with timing metadata.
   *
   * Output:
   * - Returns a Promise resolving to { blob, startedAt, endedAt }.
   */
  stopSessionRecording() {
    return new Promise((resolve, reject) => {
      if (this.sessionStoppedResult) {
        const result = this.sessionStoppedResult;

        this.sessionStoppedResult = null;

        resolve(result);
        return;
      }

      const recorder = this.sessionMediaRecorder;

      if (!recorder) {
        reject(
          new Error(
            "Session recording has not started."
          )
        );
        return;
      }

      if (recorder.state === "inactive") {
        this.sessionMediaRecorder = null;
        this.sessionRecordedChunks = [];
        this.sessionStopping = false;

        reject(new Error("Session recording is already stopped."));
        return;
      }

      if (this.sessionStopping) {
        recorder.addEventListener(
          "stop",
          () => {
            this.stopSessionRecording()
              .then(resolve)
              .catch(reject);
          },
          { once: true }
        );

        return;
      }

      this.sessionStopping = true;

      const startedAt = this.sessionStartedAt;

      recorder.onstop = () => {
        const blob = new Blob(
          this.sessionRecordedChunks,
          {
            type:
              recorder.mimeType ||
              "video/webm",
          }
        );

        const endedAt = new Date();

        const result = {
          blob,
          startedAt,
          endedAt,
        };

        this.sessionMediaRecorder = null;
        this.sessionRecordedChunks = [];

        if (this.sessionStream) {
          this.sessionStream
            .getTracks()
            .forEach((track) => track.stop());

          this.sessionStream = null;
        }

        this.sessionStartedAt = null;
        this.sessionStopping = false;

        resolve(result);
      };

      recorder.onerror = (event) => {
        this.sessionMediaRecorder = null;
        this.sessionRecordedChunks = [];
        this.sessionStartedAt = null;
        this.sessionStopping = false;

        reject(
          event.error ||
          new Error(
            "Session recording failed."
          )
        );
      };

      recorder.stop();
    });
  }

  /**
   * Starts recording the candidate's webcam response for the current question.
   *
   * Output:
   * - Initialises and starts a MediaRecorder using the stored candidate stream.
   */
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

  /**
   * Stops the current question recording and returns the recorded blob.
   *
   * Output:
   * - Returns a Promise resolving to a Blob containing the recorded video.
   */
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

  /**
   * Stops all tracks on the candidate media stream and clears it.
   *
   * Output:
   * - Stops all MediaStreamTrack instances and nullifies the stream reference.
   */
  stopStream() {
    if (!this.stream) {
      return;
    }

    this.stream.getTracks().forEach((track) => {
      track.stop();
    });

    this.stream = null;
  }

  /**
   * Stops and discards all active recorders and media streams.
   * Used when the interview is aborted or an error occurs.
   *
   * Output:
   * - Resets all internal recording and stream state to its initial values.
   */
  cleanup() {
    const recorder = this.mediaRecorder;
    if (recorder?.state === "recording") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];

    if (this.sessionMediaRecorder?.state === "recording") {
      this.sessionMediaRecorder.ondataavailable = null;
      this.sessionMediaRecorder.onstop = null;
      this.sessionMediaRecorder.stop();
    }

    this.sessionMediaRecorder = null;
    this.sessionRecordedChunks = [];
    if (this.sessionStream) {
      this.sessionStream.getTracks().forEach((track) => track.stop());

      this.sessionStream = null;
    }

    this.sessionStartedAt = null;
    this.sessionStopping = false;
    this.onScreenShareEnded = null;
    this.screenShareEnded = false;
    this.stopStream();
  }

  /**
   * Checks whether a candidate media stream has been set.
   *
   * Output:
   * - Returns true when a stream is available; otherwise false.
   */
  hasStream() {
    return this.stream !== null;
  }

  /**
   * Uploads a recorded session
   */
  async uploadSessionRecording({
    sessionId,
    candidateId,
    blob,
    startedAt,
    endedAt,
  }) {
    if (!sessionId?.trim()) {
      throw new Error("Session ID is required.");
    }

    if (!candidateId?.trim()) {
      throw new Error("Candidate ID is required.");
    }

    if (!(blob instanceof Blob) || blob.size <= 0) {
      throw new Error("A valid session recording is required.");
    }

    const file = new File([blob], `session-${sessionId.trim()}.webm`,
      {
        type: blob.type || "video/webm",
      });

    const formData = new FormData();
    formData.append("SessionId", sessionId.trim());
    formData.append("CandidateId", candidateId.trim());
    formData.append("Recording", file);
    formData.append("StartedAt", startedAt.toISOString());
    if (endedAt) {
      formData.append("EndedAt", endedAt.toISOString());
    }

    const response = await apiClient.post("/session-recordings/upload", formData);
    return response.data;
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
 * Retrieves the complete interview session recording.
 */
  async getSessionRecordingBySessionId(sessionId) {
    if (!sessionId?.trim()) {
      throw new Error("Session ID is required.");
    }

    try {
      const response = await apiClient.get(
        `/session-recordings/session/${encodeURIComponent(
          sessionId.trim()
        )}`
      );

      return response.data?.data ?? null;
    } catch (error) {
      if (error?.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Builds the streaming URL for a complete session recording.
   */
  getSessionRecordingStreamUrl(recordingId) {
    if (!recordingId?.trim()) {
      throw new Error("Session recording ID is required.");
    }

    return (
      `${apiClient.defaults.baseURL}/session-recordings/` +
      `${encodeURIComponent(recordingId.trim())}/stream`
    );
  }

  /**
   * Deletes a complete session recording.
   */
  async deleteSessionRecording(recordingId) {
    if (!recordingId?.trim()) {
      throw new Error("Session recording ID is required.");
    }

    const response = await apiClient.delete(
      `/session-recordings/${encodeURIComponent(recordingId.trim())}`
    );

    return response.data;
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