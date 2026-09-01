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

/**
 * Checks and requests the browser permissions required for the interview.
 *
 * Input:
 * - Reads the current interview session information from router state.
 *
 * Output:
 * - Displays camera, microphone, and screen-sharing permission status
 *   and allows the candidate to continue when requirements are satisfied.
 */

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

  /**
   * Requests camera, microphone, and screen sharing permissions from the browser.
   *
   * Input:
   * - No direct parameters. Uses the current session state.
   *
   * Output:
   * - Initialises media streams, starts session recording, logs permission events,
   *   and updates permissionGranted state.
   */
  const handlePermission = async () => {
    setError("");

    // Browser support validation
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support camera and microphone access.");
      return;
    }

    let cameraStream = null;
    let displayStream = null;

    let cameraGranted = false;
    let microphoneGranted = false;
    let screenGranted = false;

    try {
      setLoading(true);

      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      recordingService.setStream(cameraStream);

      cameraGranted=true;
      microphoneGranted = true;

      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenGranted =true;

      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "SCREEN_SHARE_GRANTED",
        module: "PERMISSION",
        metadataJson: JSON.stringify({
          screen: true,
          timestamp: new Date().toISOString(),
        }),
      });

      recordingService.startSessionRecording(displayStream, cameraStream);

      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "PERMISSION_GRANTED",
        module: "PERMISSION",
        metadataJson: JSON.stringify({
          camera: true,
          microphone: true,
          screen: true,
          timestamp: new Date().toISOString(),
        }),
      });

      setPermissionGranted(true);
    } catch (err) {
      recordingService.cleanup();

      if (displayStream) {
        displayStream.getTracks().forEach((track) => {
          track.stop();
      });
    }
      console.error(err);

      try {
        await createActivityEvent({
          sessionId,
          candidateId,
          eventType: "PERMISSION_DENIED",
          module: "PERMISSION",
          metadataJson: JSON.stringify({
            camera: cameraGranted,
            microphone: microphoneGranted,
            screen: screenGranted,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (eventError) {
        console.error(eventError);
      }

      setError(
        "Camera, microphone and screen sharing permission is required to continue the interview."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigates the candidate to the interview introduction page.
   *
   * Input:
   * - No direct parameters. Uses the current session state.
   *
   * Output:
   * - Navigates to the interview intro route, passing session state.
   */
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
                Camera, Microphone & Screen sharing Permission
              </h2>

              <p className="text-muted">
                Before starting the interview, please allow camera, microphone and screen sharing
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
                    "Allow Camera, Microphone & Screen"
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