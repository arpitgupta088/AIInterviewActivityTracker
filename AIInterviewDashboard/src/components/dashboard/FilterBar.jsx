import React from "react";
import { Row, Col, Form, Card } from "react-bootstrap";

/**
 * Provides search and event-type filtering controls for dashboard activity data.
 *
 * Input:
 * - searchTerm: Current candidate/session search text.
 * - setSearchTerm: Callback used to update the search text.
 * - selectedEvent: Currently selected activity event type.
 * - setSelectedEvent: Callback used to update the selected event type.
 *
 * Output:
 * - Renders search and event-type filter controls.
 */
function FilterBar({
  searchTerm,
  setSearchTerm,
  selectedEvent,
  setSelectedEvent,
}) {
  const eventOptions = [
    {
      value: "PERMISSION_GRANTED",
      label: "Permission Granted",
    },
    {
      value: "PERMISSION_DENIED",
      label: "Permission Denied",
    },
    {
      value: "INTRO_STARTED",
      label: "Introduction Started",
    },
    {
      value: "INTRO_COMPLETED",
      label: "Introduction Completed",
    },
    {
      value: "INTRO_SKIPPED",
      label: "Introduction Skipped",
    },
    {
      value: "INTERVIEW_STARTED",
      label: "Interview Started",
    },
    {
      value: "VIDEO_COMPLETED",
      label: "Question Video Completed",
    },
    {
      value: "VIDEO_PLAYBACK_FAILED",
      label: "Video Playback Failed",
    },
    {
      value: "QUESTION_REPLAYED",
      label: "Question Replayed",
    },
    {
      value: "RECORDING_STARTED",
      label: "Recording Started",
    },
    {
      value: "RECORDING_STOPPED",
      label: "Recording Stopped",
    },
    {
      value: "RECORDING_UPLOADED",
      label: "Recording Uploaded",
    },
    {
      value: "QUESTION_COMPLETED",
      label: "Question Completed",
    },
    {
      value: "NEXT_QUESTION_CLICKED",
      label: "Next Question",
    },
    {
      value: "TAB_SWITCHED",
      label: "Tab Switched",
    },
    {
      value: "TAB_RETURNED",
      label: "Tab Returned",
    },
    {
      value: "WINDOW_BLURRED",
      label: "Window Blurred",
    },
    {
      value: "WINDOW_FOCUSED",
      label: "Window Focused",
    },
    {
      value: "FULLSCREEN_ENTERED",
      label: "Fullscreen Entered",
    },
    {
      value: "FULLSCREEN_EXITED",
      label: "Fullscreen Exited",
    },
    {
      value: "NETWORK_OFFLINE",
      label: "Network Offline",
    },
    {
      value: "NETWORK_ONLINE",
      label: "Network Online",
    },
    {
      value: "SCREEN_SHARE_ENDED",
      label: "Screen Share Ended",
    },
    {
      value: "SESSION_RECORDING_UPLOADED",
      label: "Session Recording Uploaded",
    },
    {
      value: "INTERVIEW_COMPLETED",
      label: "Interview Completed",
    },
    {
      value: "INTERVIEW_ABORTED",
      label: "Interview Aborted",
    },
    {
      value: "PAGE_LEFT",
      label: "Page Left",
    },
  ];

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body className="p-3">
        <Row className="g-3">
          <Col xs={12} md={6} lg={4}>
            <Form.Group controlId="searchCandidate">
              <Form.Label className="visually-hidden">
                Search candidate or session
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="Search by Candidate ID or Session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Form.Group controlId="eventTypeFilter">
              <Form.Label className="visually-hidden">
                Filter by event type
              </Form.Label>

              <Form.Select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="ALL">All Event Types</option>

                {eventOptions.map((event) => (
                  <option key={event.value} value={event.value}>
                    {event.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FilterBar;