import { useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";

function SessionRecordings({
    recordings = [],
    loading = false,
    error = "",
    getStreamUrl,
    onDelete,
}) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = async (recordingId) => {
        if (!onDelete || !recordingId) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this recording?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(recordingId);
            await onDelete(recordingId);
        } catch (error) {
            console.error("Failed to delete recording:", error);
            alert("Unable to delete recording.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-5 text-center">
                    <Spinner animation="border" role="status" />

                    <p className="text-muted mt-3 mb-0">
                        Loading recordings...
                    </p>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mb-4">
                {error}
            </Alert>
        );
    }

    return (
        <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">
                            Interview Recordings
                        </h5>

                        <p className="text-muted mb-0">
                            Recorded responses from this interview session.
                        </p>
                    </div>

                    <Badge bg="primary" pill>
                        {recordings.length}
                    </Badge>
                </div>

                {recordings.length === 0 ? (
                    <Alert variant="info" className="mb-0">
                        No recordings are available for this session.
                    </Alert>
                ) : (
                    <Row className="g-4">
                        {recordings.map((recording) => {
                            const streamUrl = getStreamUrl(recording.id);

                            const fileSizeMb = (
                                recording.fileSize /
                                (1024 * 1024)
                            ).toFixed(2);

                            return (
                                <Col
                                    key={recording.id}
                                    xs={12}
                                    lg={6}
                                >
                                    <Card className="h-100 border shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 className="fw-bold mb-1">
                                                        Question {recording.questionNumber}
                                                    </h6>

                                                    <small className="text-muted">
                                                        {recording.fileName}
                                                    </small>
                                                </div>

                                                <Badge bg="secondary">
                                                    {recording.contentType}
                                                </Badge>
                                            </div>

                                            <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden mb-3">
                                                <video
                                                    controls
                                                    preload="metadata"
                                                    className="w-100 h-100"
                                                    src={streamUrl}
                                                >
                                                    Your browser does not support video playback.
                                                </video>
                                            </div>

                                            <div className="small text-muted mb-3">
                                                <div className="mb-1">
                                                    <strong>File size:</strong>{" "}
                                                    {fileSizeMb} MB
                                                </div>

                                                <div>
                                                    <strong>Uploaded:</strong>{" "}
                                                    {recording.createdAt
                                                        ? new Date(
                                                            recording.createdAt
                                                        ).toLocaleString()
                                                        : "N/A"}
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    disabled={deletingId === recording.id}
                                                    onClick={() =>
                                                        handleDelete(recording.id)
                                                    }
                                                >
                                                    {deletingId === recording.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </Card.Body>
        </Card>
    );
}

export default SessionRecordings;