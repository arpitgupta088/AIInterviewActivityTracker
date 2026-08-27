/**
 * Displays aggregated activity information for an interview session.
 *
 * Input:
 * - summary: Interview summary data returned by the backend.
 * - activitySummary: Calculated activity metrics for the current session.
 *
 * Output:
 * - Renders interview summary and activity summary information.
 */

import { Badge, Card, Col, Row } from "react-bootstrap";

const formatDate = (value) => {
    if (!value) {
        return "N/A";
    }

    return new Date(value).toLocaleString();
};

function InterviewSummaryCard({
    summary,
    activitySummary,
}) {
    return (
        <Card className="shadow-sm border-0 mb-4">

            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">
                    Interview Summary
                </h5>
            </Card.Header>

            <Card.Body>

                {!summary ? (
                    <div className="text-center py-3">

                        <p className="text-muted mb-2">
                            No interview summary available.
                        </p>

                        <small className="text-secondary">
                            The summary has not been generated for this session yet.
                        </small>

                    </div>
                ) : (
                    <Row className="g-4">

                        <Col md={4}>
                            <small className="text-muted d-block">
                                Total Events
                            </small>

                            <h5>
                                {summary.totalEventsCount}
                            </h5>
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
                                {summary.isAbortedByCandidate
                                    ? "Yes"
                                    : "No"}
                            </Badge>
                        </Col>

                        <Col md={6}>
                            <small className="text-muted d-block">
                                Last Active
                            </small>

                            {formatDate(
                                summary.lastActiveTimestamp
                            )}
                        </Col>

                        <Col md={6}>
                            <small className="text-muted d-block">
                                Summary Notes
                            </small>

                            {summary.summaryNotes}
                        </Col>

                    </Row>
                )}

                <hr className="my-4" />

                <h6 className="fw-bold mb-3">
                    Activity Summary
                </h6>

                <Row className="g-4">

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Total Events
                        </small>

                        <h5>
                            {activitySummary?.totalEvents ?? 0}
                        </h5>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Tab Switches
                        </small>

                        <Badge bg="warning">
                            {activitySummary?.tabSwitches ?? 0}
                        </Badge>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Video Failures
                        </small>

                        <Badge bg="danger">
                            {activitySummary?.videoFailures ?? 0}
                        </Badge>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Network Interruptions
                        </small>

                        <Badge bg="warning">
                            {activitySummary?.networkInterruptions ?? 0}
                        </Badge>
                    </Col>

                    <Col md={4}>
                        <small className="text-muted d-block">
                            Page Leaves
                        </small>

                        <Badge bg="danger">
                            {activitySummary?.pageLeaves ?? 0}
                        </Badge>
                    </Col>

                </Row>

            </Card.Body>

        </Card>
    );
}

export default InterviewSummaryCard;