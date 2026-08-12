import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
} from "react-bootstrap";

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
  } = state;

  return (
    <Container className="py-5">

      <Row className="justify-content-center">

        <Col md={8} lg={7}>

          <Card className="shadow">

            <Card.Body className="text-center p-5">

              <h2 className="mb-3">
                Interview Completed
              </h2>

              <p className="text-muted">
                Thank you for completing your AI Interview.
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

              <Alert variant="success" className="mt-4">
                Your interview has been submitted successfully.
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