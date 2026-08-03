import { Card, Table } from "react-bootstrap";

/**
 * Displays activity events for a specific interview session.
 * Maps to the backend ActivityEventResponse DTO.
 */
function SessionEventTable({ events = [] }) {
  const safeEvents = Array.isArray(events) ? events : [];

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
        <h5 className="mb-0 fw-bold">Session Activity Events</h5>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Event Type</th>
                <th>Module</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {safeEvents.length > 0 ? (
                safeEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <code>{event.eventType || "UNKNOWN"}</code>
                    </td>

                    <td>{event.module || "N/A"}</td>

                    <td className="text-muted">
                      {formatTimestamp(event.timestamp)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    No activity events recorded for this session.
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

export default SessionEventTable;