import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";

import {
  createInterviewSession,
  createActivityEvent,
} from "../services/interviewService";

function InterviewLanding() {
  const navigate = useNavigate();

  const [candidateId, setCandidateId] = useState("");
  const [interviewId, setInterviewId] = useState("INTERVIEW-001");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !candidateId.trim() ||
      !interviewId.trim() ||
      !email.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    const sessionId = `SESSION-${Date.now()}`;

    try {
      setLoading(true);

      await createInterviewSession({
        sessionId,
        candidateId: candidateId.trim(),
        interviewId: interviewId.trim(),
      });

      await createActivityEvent({
        sessionId,
        candidateId: candidateId.trim(),
        eventType: "EMAIL_SUBMITTED",
        module: "INTERVIEW",
        metadataJson: JSON.stringify({
          email: email.trim(),
        }),
      });

      navigate("/interview/permission", {
        state: {
          sessionId,
          candidateId: candidateId.trim(),
          interviewId: interviewId.trim(),
          email: email.trim(),
        },
      });
    } catch (error) {
      console.error(error);

      setError("Unable to start interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">

      <Row className="justify-content-center">

        <Col md={7} lg={6}>

          <Card className="shadow">

            <Card.Body className="p-4">

              <h2 className="mb-4 text-center">
                AI Interview
              </h2>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleContinue}>

                <Form.Group className="mb-3">

                  <Form.Label>
                    Candidate ID
                  </Form.Label>

                  <Form.Control
                    value={candidateId}
                    onChange={(e) =>
                      setCandidateId(e.target.value)
                    }
                    placeholder="Candidate ID"
                  />

                </Form.Group>

                <Form.Group className="mb-3">

                  <Form.Label>
                    Interview ID
                  </Form.Label>

                  <Form.Control
                    value={interviewId}
                    onChange={(e) =>
                      setInterviewId(e.target.value)
                    }
                  />

                </Form.Group>

                <Form.Group className="mb-4">

                  <Form.Label>
                    Email
                  </Form.Label>

                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Email Address"
                  />

                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Starting...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

              </Form>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>
  );
}

export default InterviewLanding;