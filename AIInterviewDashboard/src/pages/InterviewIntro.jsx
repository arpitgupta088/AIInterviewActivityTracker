import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
} from "react-bootstrap";

import { createActivityEvent } from "../services/interviewService";

/**
 * Displays the interview introduction video and controls the transition
 * into the interview.
 *
 * Input:
 * - Reads session, candidate, interview, and email information
 *   from router state.
 *
 * Output:
 * - Renders the introduction video, skip/start controls,
 *   and logs introduction activity events.
 */
function InterviewIntro() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const videoRef = useRef(null);
  const introStartedLoggedRef = useRef(false);
  const introFinishedRef = useRef(false);

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!state?.sessionId || !state?.candidateId) {
      return;
    }

    if (introStartedLoggedRef.current) {
      return;
    }

    introStartedLoggedRef.current = true;
    
    /**
 * Logs the start of the interview introduction.
 *
 * Input:
 * - Uses the session and candidate identifiers from router state.
 *
 * Output:
 * - Creates an INTRO_STARTED activity event in the backend.
 */

    const logIntroStarted = async () => {
      try {
        await createActivityEvent({
          sessionId: state.sessionId,
          candidateId: state.candidateId,
          eventType: "INTRO_STARTED",
          module: "INTRO",
          metadataJson: JSON.stringify({
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to log intro started event:", error);
      }
    };

    logIntroStarted();
  }, [state]);

  if (!state) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Invalid interview session. Please start again.
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
 * Handles completion of the introduction video.
 *
 * Input:
 * - No explicit parameters.
 *
 * Output:
 * - Marks the introduction as completed and logs INTRO_COMPLETED.
 */

  const handleVideoEnded = async () => {

    if (introFinishedRef.current) {
      return;
    }

    introFinishedRef.current = true;

    setVideoCompleted(true);

    try {
      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "INTRO_COMPLETED",
        module: "INTRO",
        metadataJson: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  /**
 * Skips the interview introduction video.
 *
 * Input:
 * - No explicit parameters.
 *
 * Output:
 * - Stops the introduction video, marks it as completed,
 *   and logs INTRO_SKIPPED.
 */

  const handleSkip = async () => {
    if (introFinishedRef.current) {
      return;
    }

    introFinishedRef.current = true;
    
    if (videoRef.current) {
      videoRef.current.pause();
    }

    setVideoCompleted(true);

    try {
      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "INTRO_SKIPPED",
        module: "INTRO",
        metadataJson: JSON.stringify({
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  /**
 * Starts the interview after the introduction is completed or skipped.
 *
 * Input:
 * - Uses the current session and candidate identifiers.
 *
 * Output:
 * - Logs the interview start event and navigates to the interview flow.
 */

  const handleStartInterview = async () => {
    try {
      await createActivityEvent({
        sessionId,
        candidateId,
        eventType: "INTERVIEW_STARTED",
        module: "INTERVIEW",
        metadataJson: JSON.stringify({
          interviewId,
          timestamp: new Date().toISOString(),
        }),
      });

      navigate("/interview/questions", {
        state: {
          sessionId,
          candidateId,
          interviewId,
          email,
        },
      });
    } catch (error) {
      console.error("Failed to start interview:", error);

      setError("Unable to start the interview. Please try again.");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">

        <Col lg={8}>

          <Card className="shadow">

            <Card.Body>

              <h2 className="text-center mb-4">
                Interview Introduction
              </h2>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <video
                ref={videoRef}
                width="100%"
                controls
                autoPlay
                onEnded={handleVideoEnded}
              >
                <source
                  src="/videos/intro.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="d-flex justify-content-between mt-4">

                {!videoCompleted ? (

                  <Button
                    variant="outline-secondary"
                    onClick={handleSkip}
                  >
                    Skip Intro
                  </Button>

                ) : (

                  <Button
                    variant="success"
                    onClick={handleStartInterview}
                  >
                    Start Interview
                  </Button>

                )}

              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>
    </Container>
  );
}

export default InterviewIntro;