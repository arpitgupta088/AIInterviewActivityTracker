import { Badge, Card, Col, Row } from "react-bootstrap";

/**
 * Displays primary details of an interview session.
 * Maps to the backend InterviewSessionResponse DTO.
 */
function SessionInfo({ session }) {
  if (!session) {
    return null;
  }

  const getStatusVariant = (status) => {
    switch (status?.trim().toLowerCase()) {
      case "active":
        return "success";

      case "completed":
        return "secondary";

      case "terminated":
        return "danger";

      default:
        return "primary";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString();
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold">Session Information</h5>
      </Card.Header>

      <Card.Body>
        <Row className="g-4">
          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              Candidate ID
            </small>
            <span className="fw-semibold">
              {session.candidateId || "N/A"}
            </span>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              Session ID
            </small>
            <span className="fw-semibold">
              {session.sessionId || "N/A"}
            </span>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              Status
            </small>

            {session.status ? (
              <Badge bg={getStatusVariant(session.status)}>
                {session.status}
              </Badge>
            ) : (
              <span className="text-muted">N/A</span>
            )}
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              Interview ID
            </small>
            <span>{session.interviewId || "N/A"}</span>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              Start Time
            </small>
            <span>{formatDateTime(session.startTime)}</span>
          </Col>

          <Col xs={12} md={6} lg={4}>
            <small className="text-muted d-block mb-1">
              End Time
            </small>
            <span>{formatDateTime(session.endTime)}</span>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default SessionInfo;