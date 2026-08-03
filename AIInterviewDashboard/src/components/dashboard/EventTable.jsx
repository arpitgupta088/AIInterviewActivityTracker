import React from "react";
import { Badge, Card, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * Displays recent activity events received from the backend.
 * Search and filtering are performed by the backend api.
 */
function EventTable({
    events = [],
    loading = false,
}) {

    /**
     * Formats an API timestmp into the user's local date and time
     */
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


    return (
        <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">
                    Recent Activity Events
                </h5>
            </Card.Header>

            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Candidate ID</th>
                                <th>Session ID</th>
                                <th>Event Type</th>
                                <th>Module</th>
                                <th>Timestamp</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-5"
                                    >
                                        <Spinner
                                            animation="border"
                                            variant="primary"
                                        />

                                        <div className="mt-2 text-muted">
                                            Loading events...
                                        </div>
                                    </td>
                                </tr>
                            ) : events.length > 0 ? (
                                events.map((event) => (
                                    <tr key={event.id}>
                                        <td className="fw-semibold">
                                            {event.candidateId || "N/A"}
                                        </td>

                                        <td>
                                            {event.sessionId ? (
                                                <Link
                                                    to={`/sessions/${encodeURIComponent(
                                                        event.sessionId
                                                    )}`}
                                                    className="text-primary text-decoration-none fw-medium"
                                                >
                                                    {event.sessionId}
                                                </Link>
                                            ) : (
                                                <span className="text-muted">
                                                    N/A
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <code>
                                                {event.eventType || "UNKNOWN"}
                                            </code>
                                        </td>

                                        <td>
                                            {event.module || "N/A"}
                                        </td>

                                        <td className="text-muted">
                                            {formatTimestamp(
                                                event.timestamp
                                            )}
                                        </td>

                                        <td>
                                            <Badge bg="info">
                                                Logged
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-4 text-muted"
                                    >
                                        No activity events found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}

export default EventTable;