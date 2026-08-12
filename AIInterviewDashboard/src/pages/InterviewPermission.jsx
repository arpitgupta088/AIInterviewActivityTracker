import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import recordingService from "../services/recordingService";

import { createActivityEvent } from "../services/interviewService";

function InterviewPermission() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!state) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Invalid interview session. Please start from the landing page.
        </Alert>
      </Container>
    );
  }

  const {
    sessionId,
    candidateId,
    interviewId,
    email,
  } = state;

  const handlePermission = async () => {
    setError("");

    // Browser support validation
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera and microphone access.");
      return;
    }

    try {
      setLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      recordingService.setStream(stream);

      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "PERMISSION_GRANTED",
        module: "PERMISSION",
        metadataJson: JSON.stringify({
          camera: true,
          microphone: true,
          timestamp: new Date().toISOString(),
        }),
      });

      setPermissionGranted(true);
    } catch (err) {
      console.error(err);

      try {
        await createActivityEvent({
          sessionId,
          candidateId,
          eventType: "PERMISSION_DENIED",
          module: "PERMISSION",
          metadataJson: JSON.stringify({
            camera: false,
            microphone: false,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error(eventError);
      }

      setError(
        "Camera and microphone permission is required to continue the interview."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/interview/intro", {
      state: {
        sessionId,
        candidateId,
        interviewId,
        email,
      },
    });
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">

              <h2 className="text-center mb-4">
                Camera & Microphone Permission
              </h2>

              <p className="text-muted">
                Before starting the interview, please allow camera and microphone
                access.
              </p>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              {!permissionGranted ? (
                <Button
                  className="w-100"
                  onClick={handlePermission}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Requesting Permission...
                    </>
                  ) : (
                    "Allow Camera & Microphone"
                  )}
                </Button>
              ) : (
                <>
                  <Alert variant="success">
                    Permission granted successfully.
                  </Alert>

                  <Button
                    variant="success"
                    className="w-100"
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default InterviewPermission;