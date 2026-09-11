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
  SCREEN_SHARE_GRANTED: "Screen Share Granted",
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

const EVENT_TYPES = [
  ...Object.keys(EVENT_LABELS),
  "NETWORK_OFFLINE",
  "NETWORK_ONLINE",
  "PAGE_LOAD",
  "PAGE_LEFT",
  "PAGE_UNLOAD",
  "TAB_HIDDEN",
  "TAB_VISIBLE",
  "APPLICATION_ERROR",
  "UNHANDLED_PROMISE_REJECTION",
];

const MODULES = [
  "INTERVIEW",
  "INTRO",
  "PERMISSION",
  "BROWSER_LIFECYCLE",
];

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

const getEventTimestamp = (event) => {
  const metadata = parseMetadata(event.metadataJson);

  return metadata.timestamp || event.timestamp;
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

  if (metadata.online === false) {
    values.push("Network: Offline");
  }

  if (metadata.online === true) {
    values.push("Network: Online");
  }

  if (metadata.disconnectedDurationMs != null) {
    const durationInSeconds =
      Number(metadata.disconnectedDurationMs) / 1000;

    values.push(
      `Disconnected for ${durationInSeconds.toFixed(1)} seconds`
    );
  }

  return values.length > 0
    ? values.join(" • ")
    : "—";
};

function SessionEventTable({
  events = [],
  totalCount = 0,
  searchTerm,
  eventTypeFilter,
  moduleFilter,
  sortOrder,
  onSearchChange,
  onEventTypeChange,
  onModuleChange,
  onSortOrderChange,
}) {
  const [viewMode, setViewMode] = useState("TABLE");
  const safeEvents = Array.isArray(events) ? events : [];

  const filteredEvents = safeEvents;

  const networkTimelineEvents = useMemo(() => {
    const networkEvents = safeEvents.filter(
      (event) =>
        event.eventType === "NETWORK_OFFLINE" ||
        event.eventType === "NETWORK_ONLINE"
    );

    return [...networkEvents].sort((a, b) => {
      const dateA = new Date(getEventTimestamp(a)).getTime();

      const dateB = new Date(getEventTimestamp(b)).getTime();

      return dateA - dateB;
    });
  }, [safeEvents]);


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
              Nwtwork Timeline
            </Button>
          </div>

          <span className="badge bg-secondary">
            {totalCount} event {totalCount === 1 ? "" : "s"}
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Col>

          <Col md={3}>
            <Form.Select
              value={eventTypeFilter}
              onChange={(e) => onEventTypeChange(e.target.value)}
            >
              <option value="ALL">All Event Types</option>

              {EVENT_TYPES.map((eventType) => (
                <option key={eventType} value={eventType}>
                  {formatEventType(eventType)}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={moduleFilter}
              onChange={(e) => onModuleChange(e.target.value)}
            >
              <option value="ALL">All Modules</option>

              {MODULES.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={2}>
            <Form.Select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
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
        ) : viewMode === "TABLE" ? (
          filteredEvents.length === 0 ? (
            <div className="text-center text-muted py-5 px-3">
              <p className="mb-1 fw-semibold">No matching events found.</p>
              <small> Try changing or clearing your search and filters.</small>
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
                          getEventTimestamp(event)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )
        ) : networkTimelineEvents.length === 0 ? (
          <div className="text-center text-muted py-5 px-3">
            <p className="mb-1 fw-semibold">
              No network events recorded.
            </p>

            <small>
              Network interruptions will appear here when the
              interview connection goes offline and comes back online.
            </small>
          </div>
        ) : (
          <div className="px-2 py-3">
            {networkTimelineEvents.map((event, index) => {
              const metadata = parseMetadata(
                event.metadataJson
              );

              const isOffline =
                event.eventType === "NETWORK_OFFLINE";

              const eventTimestamp =
                getEventTimestamp(event);
                
              if (
                event.eventType === "NETWORK_ONLINE" &&
                metadata.offlineStartedAt
              ) {
                const durationMs =
                  metadata.disconnectedDurationMs;

                const durationText =
                  durationMs != null
                    ? `${(
                      Number(durationMs) / 1000
                    ).toFixed(1)} seconds`
                    : "N/A";

                return (
                  <div
                    key={
                      event.id ||
                      `${event.eventType}-${eventTimestamp}-${index}`
                    }
                    className="border rounded p-3 mb-4 shadow-sm bg-white"
                  >
                    <div className="d-flex gap-3">

                      <div
                        className="d-flex flex-column align-items-center"
                        style={{ minWidth: "32px" }}
                      >
                        <div className="fs-5">
                          🔴
                        </div>

                        <div
                          className="border-start flex-grow-1 my-1"
                          style={{
                            minHeight: "55px",
                          }}
                        />

                        <div className="fs-5">
                          🟢
                        </div>
                      </div>

                      {/* Timeline content */}
                      <div className="flex-grow-1">

                        {/* Offline */}
                        <div>
                          <div className="fw-semibold">
                            Network Disconnected
                          </div>

                          <div className="small text-muted">
                            {formatTimestamp(
                              metadata.offlineStartedAt
                            )}
                          </div>
                        </div>

                        {/* Duration */}
                        <div
                          className="border rounded p-2 my-3 bg-light"
                        >
                          <div className="small text-muted">
                            Connection interruption
                          </div>

                          <div className="fw-semibold">
                            Disconnected for {durationText}
                          </div>
                        </div>

                        {/* Online */}
                        <div>
                          <div className="fw-semibold">
                            Network Restored
                          </div>

                          <div className="small text-muted">
                            {formatTimestamp(
                              eventTimestamp
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              }
              if (isOffline) {
                const hasPairedOnlineEvent =
                  networkTimelineEvents.some(
                    (timelineEvent) => {
                      if (
                        timelineEvent.eventType !==
                        "NETWORK_ONLINE"
                      ) {
                        return false;
                      }

                      const onlineMetadata =
                        parseMetadata(
                          timelineEvent.metadataJson
                        );

                      return (
                        onlineMetadata.offlineStartedAt &&
                        new Date(
                          onlineMetadata.offlineStartedAt
                        ).getTime() ===
                        new Date(
                          eventTimestamp
                        ).getTime()
                      );
                    }
                  );

                if (hasPairedOnlineEvent) {
                  return null;
                }

                return (
                  <div
                    key={
                      event.id ||
                      `${event.eventType}-${eventTimestamp}-${index}`
                    }
                    className="border rounded p-3 mb-4"
                  >
                    <div className="d-flex gap-3">

                      <div className="fs-5">
                        🔴
                      </div>

                      <div>
                        <div className="fw-semibold">
                          Network Disconnected
                        </div>

                        <div className="small text-muted">
                          {formatTimestamp(
                            eventTimestamp
                          )}
                        </div>

                        <div className="small text-muted mt-1">
                          Waiting for network connection
                          to be restored...
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={
                    event.id ||
                    `${event.eventType}-${eventTimestamp}-${index}`
                  }
                  className="border rounded p-3 mb-4"
                >
                  <div className="d-flex gap-3">

                    <div className="fs-5">
                      🟢
                    </div>

                    <div>
                      <div className="fw-semibold">
                        Network Restored
                      </div>

                      <div className="small text-muted">
                        {formatTimestamp(
                          eventTimestamp
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default SessionEventTable;