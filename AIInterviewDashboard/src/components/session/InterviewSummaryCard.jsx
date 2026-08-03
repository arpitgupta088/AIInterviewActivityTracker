import { Badge, Card, Col, Row } from "react-bootstrap";

function InterviewSummaryCard({ summary }) {
    if (!summary) {
        return (
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">
                        Interview Summary
                    </h5>
                </Card.Header>

                <Card.Body className="text-center py-4">
                    <p className="text-muted mb-2">
                        No interview summary available.
                    </p>

                    <small className="text-secondary">
                        The summary has not been generated for this session yet.
                    </small>
                </Card.Body>
            </Card>
        );
    }

    const formatDate = (value) => {
        if (!value) {
            return "N/A";
        }

        return new Date(value).toLocaleString();
    };

    return (
        <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">
                    Interview Summary
                </h5>
            </Card.Header>

            <Card.Body>
                <Row className="g-4">

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Total Events
                        </small>

                        <h5>{summary.totalEventsCount}</h5>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Error Events
                        </small>

                        <Badge bg="danger">
                            {summary.errorEventsCount}
                        </Badge>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Candidate Aborted
                        </small>

                        <Badge
                            bg={
                                summary.isAbortedByCandidate
                                    ? "warning"
                                    : "success"
                            }
                        >
                            {summary.isAbortedByCandidate ? "Yes" : "No"}
                        </Badge>
                    </Col>

                    <Col md={6}>
                        <small className="text-muted d-block">
                            Last Active
                        </small>

                        {formatDate(summary.lastActiveTimestamp)}
                    </Col>

                    <Col md={6}>
                        <small className="text-muted d-block">
                            Summary Notes
                        </small>

                        {summary.summaryNotes}
                    </Col>

                </Row>
            </Card.Body>
        </Card>
    );
}

export default InterviewSummaryCard;