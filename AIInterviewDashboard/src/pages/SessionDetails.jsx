/**
 * Displays detailed information for a selected interview session.
 *
 * Input:
 * - sessionId: Session identifier obtained from the route parameters.
 *
 * Output:
 * - Loads and displays session information, activity events,
 *   interview summary, and recordings.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Col, Container, Offcanvas, Row, Spinner } from "react-bootstrap";
import { Menu } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import SessionInfo from "../components/session/SessionInfo";
import SessionEventTable from "../components/session/SessionEventTable";
import InterviewSummaryCard from "../components/session/InterviewSummaryCard";
import SessionRecordings from "../components/session/SessionRecordings";
import recordingService from "../services/recordingService";

import {
  getSessionById,
  getSessionEvents,
  getInterviewSummary,
  generateInterviewSummary,
} from "../services/interviewService";

/**
 * Displays session information and activity events
 * retrieved from the backend for the selected interview session.
 */
function SessionDetails() {
  const { sessionId } = useParams();

  // Responsive sidebar state for mobile offcanvas
  const [showSidebar, setShowSidebar] = useState(false);

  const [sessionData, setSessionData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingsLoading, setRecordingsLoading] = useState(false);
  const [recordingsError, setRecordingsError] = useState("");
  const [sessionRecording, setSessionRecording] = useState(null);
  const [sessionRecordingLoading, setSessionRecordingLoading] = useState(false);
  const [sessionRecordingError, setSessionRecordingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
 * Generates an interview summary for the current session and
 * refreshes the displayed summary data.
 *
 * Input:
 * - No direct parameters. Uses the current sessionId.
 *
 * Output:
 * - Updates the summary state with the generated interview summary.
 */
  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);

      await generateInterviewSummary(sessionId);

      const summaryResponse = await getInterviewSummary(sessionId);

      setSummaryData(summaryResponse?.data ?? summaryResponse ?? null);
    }
    catch (error) {
      console.error("Failed to generate summary:", error);

      alert("Unable to generate summary.");
    }
    finally {
      setGeneratingSummary(false);
    }
  };

  useEffect(() => {

    /**
    * Loads session details, activity events, recordings, and interview
    * summary data for the current session.
    *
    * Input:
    * - No direct parameters. Uses the current sessionId.
    *
    * Output:
    * - Updates the component state with the retrieved session data.
    */
    const fetchSessionDetails = async () => {
      if (!sessionId?.trim()) {
        setError("Invalid session ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [sessionResponse, eventsResponse, recordingsResponse, sessionRecordingResponse] = await Promise.all([
          getSessionById(sessionId),
          getSessionEvents(sessionId),

          recordingService.getRecordingsBySessionId(sessionId),

          recordingService.getSessionRecordingBySessionId(sessionId),
        ]);

        const recordings = recordingsResponse ?? [];
        setRecordings(recordings);

        setSessionRecording(sessionRecordingResponse ?? null);

        let summaryResponse = null;
        try {
          summaryResponse = await getInterviewSummary(sessionId);
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }

        const session = sessionResponse?.data ?? sessionResponse ?? null;

        const events = Array.isArray(eventsResponse?.data) ? eventsResponse.data
          : Array.isArray(eventsResponse)
            ? eventsResponse
            : [];

        const summary = summaryResponse?.data ?? summaryResponse ?? null;

        setSessionData(session);
        setEventsData(events);
        setSummaryData(summary);

      } catch (error) {
        console.error("Failed to load session details:", error);

        setError(
          "Unable to load session details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const activitySummary = {
    totalEvents: eventsData.length,

    tabSwitches: eventsData.filter(
      (event) => event.eventType === "TAB_SWITCHED"
    ).length,

    videoFailures: eventsData.filter(
      (event) => event.eventType === "VIDEO_PLAYBACK_FAILED"
    ).length,

    networkInterruptions: eventsData.filter(
      (event) =>
        event.eventType === "NETWORK_OFFLINE" ||
        event.eventType === "NETWORK_ONLINE"
    ).length,

    pageLeaves: eventsData.filter(
      (event) => event.eventType === "PAGE_LEFT"
    ).length,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>

          <p className="text-muted mt-3 mb-0">
            Loading session details...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          {error}
        </Alert>
      );
    }

    if (!sessionData) {
      return (
        <Alert variant="warning">
          Session information was not found.
        </Alert>
      );
    }

    return (
      <>
        <SessionInfo session={sessionData} />

        {!summaryData && (
          <>
            {sessionData.status?.trim().toLowerCase() === "completed" ? (
              <div className="mb-3">
                <Button
                  variant="primary"
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                >
                  {generatingSummary
                    ? "Generating Summary..."
                    : "Generate Summary"}
                </Button>
              </div>
            ) : (
              <Alert variant="info" className="mb-3">
                Interview summary will be available after the interview is completed.
              </Alert>
            )}
          </>
        )}

        <InterviewSummaryCard summary={summaryData} activitySummary={activitySummary} />
        <SessionRecordings
          recordings={recordings}
          loading={recordingsLoading}
          error={recordingsError}
          getStreamUrl={(recordingId) => recordingService.getRecordingStreamUrl(recordingId)}
          onDelete={async (recordingId) => {
            await recordingService.deleteRecording(recordingId);
            setRecordings((currentRecordings) => currentRecordings.filter((recording) => recording.id !== recordingId));
          }}

          sessionRecording={sessionRecording}
          sessionRecordingLoading={sessionRecordingLoading}
          sessionRecordingError={sessionRecordingError}
          getSessionStreamUrl={(recordingId) => recordingService.getSessionRecordingStreamUrl(recordingId)}
          onDeleteSessionRecording={async (recordingId) => {
            await recordingService.deleteSessionRecording(recordingId);

            setSessionRecording(null);

          }}
        />
        <SessionEventTable events={eventsData} />
      </>
    );
  };

  return (
    <>
      <Navbar />

      {/* Mobile Sidebar Offcanvas */}
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        className="bg-dark text-white"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold">Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Sidebar />
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid className="dashboard-container">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col md={3} lg={2} className="d-none d-md-block bg-dark border-end">
            <Sidebar />
          </Col>

          {/* Main Content Area */}
          <Col xs={12} md={9} lg={10} className="bg-light dashboard-main" as="main">
            <div className="dashboard-content">

              {/* Page Header */}
              <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="fw-bold mb-1 fs-3 fs-md-2">
                    Session Details
                  </h2>
                  <p className="text-muted mb-0 small">
                    Interview Session: {sessionId}
                  </p>
                </div>
                {/* Mobile menu toggle */}
                <button
                  className="btn btn-outline-dark d-md-none d-flex align-items-center gap-2"
                  onClick={() => setShowSidebar(true)}
                  aria-label="Open Navigation"
                >
                  <Menu size={18} />
                  <span>Menu</span>
                </button>
              </div>

              {renderContent()}

            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default SessionDetails;