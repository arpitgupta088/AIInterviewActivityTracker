import React from "react";
import { Badge, Card, ListGroup } from "react-bootstrap";

/**
 * Displays interview session statistics for the dashboard.
 *
 * Input:
 * - totalSessions: Total number of interview sessions.
 * - activeSessions: Number of currently active sessions.
 * - recentEventsCount: Number of recently loaded activity events.
 *
 * Output:
 * - Renders session count and activity summary statistics.
 */

function SessionSummary({
  totalSessions = 0,
  activeSessions = 0,
  recentEventsCount = 0,
}) {
  const completedSessions = Math.max(
    totalSessions - activeSessions,
    0
  );

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold text-dark">
          Session Summary
        </h5>
      </Card.Header>

      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
          <span className="fw-medium text-secondary">
            Total Sessions
          </span>

          <Badge
            bg="primary"
            className="px-3 py-2 rounded-pill"
          >
            {totalSessions}
          </Badge>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
          <span className="fw-medium text-secondary">
            Active Sessions
          </span>

          <Badge
            bg="success"
            className="px-3 py-2 rounded-pill"
          >
            {activeSessions}
          </Badge>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
          <span className="fw-medium text-secondary">
            Completed / Inactive Sessions
          </span>

          <Badge
            bg="secondary"
            className="px-3 py-2 rounded-pill"
          >
            {completedSessions}
          </Badge>
        </ListGroup.Item>

        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
          <span className="fw-medium text-secondary">
            Recent Events Loaded
          </span>

          <Badge
            bg="info"
            className="px-3 py-2 rounded-pill"
          >
            {recentEventsCount}
          </Badge>
        </ListGroup.Item>
      </ListGroup>
    </Card>
  );
}

export default SessionSummary;