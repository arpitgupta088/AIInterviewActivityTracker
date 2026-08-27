import { useMemo, useState } from "react";
import { Card, Table, Form, Row, Col, Button } from "react-bootstrap";

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
  SCREEN_SHARE_ENDED: "Screen Share Ended",
  VIDEO_COMPLETED: "Question Video Completed",
  INTRO_STARTED: "Introduction Started",
  INTRO_COMPLETED: "Introduction Completed",
  INTRO_SKIPPED: "Introduction Skipped",
  INTERVIEW_STARTED: "Interview Started",
  RECORDING_STARTED: "Recording Started",
  RECORDING_STOPPED: "Recording Stopped",
  RECORDING_UPLOADED: "Recording Uploaded",
  NEXT_QUESTION_CLICKED: "Next Question",
  INTERVIEW_COMPLETED: "Interview Completed",
  INTERVIEW_ABORTED: "Interview Aborted",
  QUESTION_COMPLETED: "Question Completed",
  QUESTION_REPLAYED: "Question Replayed",
  SESSION_RECORDING_UPLOADED: "Session Recording Uploaded",
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

  if (metadata.replayCount != null) {
    values.push(`Replay ${metadata.replayCount}x`);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("LATEST");
  const [viewMode, setViewMode] = useState("TABLE");
  const safeEvents = Array.isArray(events) ? events : [];

  const eventTypes = useMemo(
    () => [
      ...new Set(
        safeEvents
          .map((event) => event.eventType).filter(Boolean)
      ),
    ],
    [safeEvents]
  );

  const modules = useMemo(
    () => [
      ...new Set(
        safeEvents
          .map((event) => event.module)
          .filter(Boolean)
      ),
    ],
    [safeEvents]
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = safeEvents.filter((event) => {

      const metadataText = formatMetadata(event.metadataJson).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        event.eventType?.toLowerCase().includes(normalizedSearch) ||
        event.module?.toLowerCase().includes(normalizedSearch) ||
        formatEventType(event.eventType)
          .toLowerCase()
          .includes(normalizedSearch) || metadataText.includes(normalizedSearch);

      const matchesEventType =
        eventTypeFilter === "ALL" ||
        event.eventType === eventTypeFilter;

      const matchesModule =
        moduleFilter === "ALL" ||
        event.module === moduleFilter;

      return (
        matchesSearch &&
        matchesEventType &&
        matchesModule
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();

      return sortOrder === "LATEST"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [
    safeEvents,
    searchTerm,
    eventTypeFilter,
    moduleFilter,
    sortOrder,
  ]);

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Session Activity Events</h5>

          <div className="btn-group btn-group-sm">
            <Button
              variant={viewMode === "TABLE" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("TABLE")}
            >
              Table
            </Button>

            <Button
              variant={viewMode === "TIMELINE" ? "primary" : "outline-primary"}
              onClick={() => setViewMode("TIMELINE")}
            >
              Timeline
            </Button>
          </div>

          <span className="badge bg-secondary">
            {filteredEvents.length} event {filteredEvents.length === 1 ? "" : "s"}
          </span>
        </div>
      </Card.Header>

      <Card.Body>
        <Row className="g-3 mb-3">
          <Col md={5}>
            <Form.Control
              type="search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>

          <Col md={3}>
            <Form.Select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <option value="ALL">All Event Types</option>

              {eventTypes.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {formatEventType(eventType)}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="ALL">All Modules</option>

              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="LATEST">Latest First</option>
              <option value="OLDEST">Oldest First</option>
            </Form.Select>
          </Col>
        </Row>

        {safeEvents.length === 0 ? (
          <div className="text-center text-muted py-5 px-3">
            <p className="mb-1 fw-semibold">No activity events recorded.</p>

            <small> Activity events will appear here as the interview progresses. </small>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-muted py-5 px-3">
            <p className="mb-1 fw-semibold">No matching events found.</p>
            <small> Try changing or clearing your search and filters.</small>
          </div>
        ):
          viewMode === "TABLE" ? (
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
                  {filteredEvents.map((event, index) => (
                    <tr
                      key={
                        event.id ||
                        `${event.eventType}-${event.timestamp}-${index}`
                      }
                    >
                      <td>
                        <div className="fw-semibold">
                          {formatEventType(event.eventType)}
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
                        {formatMetadata(event.metadataJson)}
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
          ) : (
            <div className="px-2 py-3">
              {filteredEvents.map((event, index) => (
                <div
                  key={
                    event.id ||
                    `${event.eventType}-${event.timestamp}-${index}`
                  }
                  className="d-flex gap-3 mb-4"
                >
                  <div className="text-muted text-nowrap">
                    {formatTimestamp(event.timestamp)}
                  </div>

                  <div className="border-start ps-3">
                    <div className="fw-semibold">
                      {formatEventType(event.eventType)}
                    </div>

                    <div className="small text-muted">
                      {event.module || "N/A"}
                    </div>

                    <div className="small text-muted mt-1">
                      {formatMetadata(event.metadataJson)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </Card.Body>
    </Card>
  );
}

export default SessionEventTable;