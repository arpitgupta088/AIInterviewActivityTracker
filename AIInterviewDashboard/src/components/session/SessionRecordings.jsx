import { useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";

/**
 * Displays question-level interview recordings and provides playback
 * and deletion controls.
 *
 * Input:
 * - recordings: Collection of recorded interview responses.
 * - loading: Indicates whether recordings are being loaded.
 * - error: Error message returned while loading recordings.
 * - getStreamUrl: Callback that returns the recording playback URL.
 * - onDelete: Callback used to delete a recording.
 *
 * Output:
 * - Renders recording cards with metadata, playback controls,
 *   loading/error states, and delete actions.
 */

function SessionRecordings({
    recordings = [],
    loading = false,
    error = "",
    getStreamUrl,
    onDelete,

    sessionRecording = null,
    sessionRecordingLoading = false,
    sessionRecordingError = "",
    getSessionStreamUrl,
    onDeleteSessionRecording,
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
                {sessionRecordingLoading && (
                    <Card className="border mb-4">
                        <Card.Body className="py-4 text-center">
                            <Spinner animation="border" size="sm" />

                            <p className="text-muted mt-2 mb-0">
                                Loading complete session recording...
                            </p>
                        </Card.Body>
                    </Card>
                )}

                {sessionRecordingError && (
                    <Alert variant="danger" className="mb-4">
                        {sessionRecordingError}
                    </Alert>
                )}

                {sessionRecording && (
                    <Card className="border shadow-sm mb-4">
                        <Card.Body>

                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h5 className="fw-bold mb-1">
                                        Complete Session Recording
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Full interview session recording including the complete session timeline.
                                    </p>
                                </div>

                                <Badge bg="success">
                                    Complete Session
                                </Badge>
                            </div>

                            <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden mb-3">
                                <video
                                    controls
                                    preload="metadata"
                                    className="w-100 h-100"
                                    src={getSessionStreamUrl(sessionRecording.id)}
                                >
                                    Your browser does not support video playback.
                                </video>
                            </div>

                            <div className="small text-muted mb-3">
                                <div className="mb-1">
                                    <strong>File:</strong>{" "}
                                    {sessionRecording.fileName}
                                </div>

                                <div className="mb-1">
                                    <strong>File size:</strong>{" "}
                                    {(
                                        sessionRecording.fileSize /
                                        (1024 * 1024)
                                    ).toFixed(2)}{" "}
                                    MB
                                </div>

                                <div className="mb-1">
                                    <strong>Started:</strong>{" "}
                                    {sessionRecording.startedAt
                                        ? new Date(
                                            sessionRecording.startedAt
                                        ).toLocaleString()
                                        : "N/A"}
                                </div>

                                <div>
                                    <strong>Ended:</strong>{" "}
                                    {sessionRecording.endedAt
                                        ? new Date(
                                            sessionRecording.endedAt
                                        ).toLocaleString()
                                        : "N/A"}
                                </div>
                            </div>

                            <div className="d-flex justify-content-end">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={async () => {
                                        if (!onDeleteSessionRecording) {
                                            return;
                                        }

                                        const confirmed = window.confirm(
                                            "Are you sure you want to delete the complete session recording?"
                                        );

                                        if (!confirmed) {
                                            return;
                                        }

                                        await onDeleteSessionRecording(
                                            sessionRecording.id
                                        );
                                    }}
                                >
                                    Delete Session Recording
                                </Button>
                            </div>

                        </Card.Body>
                    </Card>
                )}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">
                            Question Recordings
                        </h5>

                        <p className="text-muted mb-0">
                            Individual Recorded responses for each interview question.
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