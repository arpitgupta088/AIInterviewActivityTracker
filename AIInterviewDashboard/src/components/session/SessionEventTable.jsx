import { Card, Table } from "react-bootstrap";

/**
 * Displays activity events for a specific interview session.
 * Maps to the backend ActivityEventResponse DTO.
 */

const EVENT_LABELS = {
  PERMISSION_GRANTED: "Permission Granted",
  PERMISSION_DENIED: "Permission Denied",
  TAB_SWITCHED: "Tab Switched",
  TAB_RETURNED: "Tab Returned",
  WINDOW_BLURRED: "Window Blurred",
  WINDOW_FOCUSED: "Window Focused",
  FULLSCREEN_ENTERED: "Fullscreen Entered",
  FULLSCREEN_EXITED: "Fullscreen Exited",
  VIDEO_COMPLETED: "Question Video Completed",
  RECORDING_STARTED: "Recording Started",
  RECORDING_STOPPED: "Recording Stopped",
  RECORDING_UPLOADED: "Recording Uploaded",
  NEXT_QUESTION_CLICKED: "Next Question",
  INTERVIEW_COMPLETED: "Interview Completed",
  INTERVIEW_ABORTED: "Interview Aborted",
};

const formatEventType = (eventType) => {
  if (!eventType) {
    return "Unknown Event";
  }

  return (
    EVENT_LABELS[eventType] ||
    eventType
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ")
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return "N/A";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString();
};

const parseMetadata = (metadataJson) => {
  if (!metadataJson) {
    return {};
  }

  if (typeof metadataJson === "object") {
    return metadataJson;
  }

  try {
    const parsed = JSON.parse(metadataJson);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const formatMetadata = (metadataJson) => {
  const metadata = parseMetadata(metadataJson);

  const values = [];

  if (metadata.questionNumber != null) {
    values.push(`Question ${metadata.questionNumber}`);
  }

  if (metadata.fileSize != null) {
    const sizeInMb =
      Number(metadata.fileSize) / (1024 * 1024);

    values.push(`${sizeInMb.toFixed(2)} MB`);
  }

  if (metadata.visibilityState) {
    values.push(
      `Visibility: ${metadata.visibilityState}`
    );
  }

  if (
    metadata.camera != null &&
    metadata.microphone != null
  ) {
    values.push(
      `Camera: ${metadata.camera ? "Granted" : "Denied"}`,
      `Microphone: ${metadata.microphone ? "Granted" : "Denied"
      }`
    );
  }

  return values.length > 0
    ? values.join(" • ")
    : "—";
};

function SessionEventTable({ events = [] }) {
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Session Activity Events</h5>

          <span className="badge bg-secondary">
            {safeEvents.length} event {safeEvents.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {safeEvents.length === 0 ? (
          <div className="text-center text-muted py-5 px-3">
            <p className="mb-1 fw-semibold">No activity events recorded.</p>

            <small> Activity events will appear here as the interview progresses. </small>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Event Type</th>
                  <th>Module</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {safeEvents.map((event, index) => (
                  <tr
                    key={
                      event.id ||
                      `${event.eventType}-${event.timestamp}-${index}`
                    }
                  >
                    <td>
                      <div className="fw-semibold">
                        {formatEventType(
                          event.eventType
                        )}
                      </div>

                      {event.eventType && (
                        <small className="text-muted">
                          {event.eventType}
                        </small>
                      )}
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {event.module || "N/A"}
                      </span>
                    </td>

                    <td className="text-muted">
                      {formatMetadata(
                        event.metadataJson
                      )}
                    </td>

                    <td className="text-muted text-nowrap">
                      {formatTimestamp(
                        event.timestamp
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default SessionEventTable;