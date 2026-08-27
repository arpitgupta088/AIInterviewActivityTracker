import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
} from "react-bootstrap";

/**
 * Displays the final status of an interview session.
 *
 * Input:
 * - Reads session information and interview status from router state.
 *
 * Output:
 * - Renders the completed or aborted interview confirmation
 *   with session details and a dashboard navigation option.
 */

function InterviewComplete() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Invalid interview session.
        </Alert>
      </Container>
    );
  }

  const {
    sessionId,
    candidateId,
    interviewId,
    email,
    status,
  } = state;

  return (
    <Container className="py-5">

      <Row className="justify-content-center">

        <Col md={8} lg={7}>

          <Card className="shadow">

            <Card.Body className="text-center p-5">

              <h2 className="mb-3">
                {status === "ABORTED"
                ?"Interview Aborted":"Interview Completed"}
              </h2>

              <p className="text-muted">
                {status === "ABORTED"
                ? "The interview was ended before all the questions were completed."
                : "Thank you for completing your AI Interview."}
              </p>

              <hr />

              <p>
                <strong>Session ID:</strong> {sessionId}
              </p>

              <p>
                <strong>Candidate ID:</strong> {candidateId}
              </p>

              <p>
                <strong>Interview ID:</strong> {interviewId}
              </p>

              <p>
                <strong>Email:</strong> {email}
              </p>

              <Alert variant={status === "ABORTED" ? "warning" : "success"} className="mt-4">
                {status === "ABORTED"
                ? "The interview session has been ended."
                :"Your interview has been submitted successfully."}
              </Alert>

              <Button
                className="mt-3"
                onClick={() => navigate("/")}
              >
                Back to Dashboard
              </Button>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}

export default InterviewComplete;