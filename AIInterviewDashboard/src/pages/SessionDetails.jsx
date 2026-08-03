import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import SessionInfo from "../components/session/SessionInfo";
import SessionEventTable from "../components/session/SessionEventTable";
import InterviewSummaryCard from "../components/session/InterviewSummaryCard";

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

  const [sessionData, setSessionData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);

      await generateInterviewSummary(sessionId);

      const summaryResponse = await getInterviewSummary(sessionId);

      setSummaryData(summaryResponse?.data ?? null);
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
    const fetchSessionDetails = async () => {
      if (!sessionId?.trim()) {
        setError("Invalid session ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [sessionResponse, eventsResponse] = await Promise.all([
          getSessionById(sessionId),
          getSessionEvents(sessionId),
        ]);

        let summaryResponse = null;
        try {
          summaryResponse = await getInterviewSummary(sessionId);
        } catch (error) {
          if (error?.response?.status !== 404) {
            throw error;
          }
        }

        const session = sessionResponse?.data ?? sessionResponse;
        const events = eventsResponse?.data ?? eventsResponse;
        const summary = summaryResponse?.data ?? null;

        setSessionData(session ?? null);
        setEventsData(Array.isArray(events) ? events : []);
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

        <InterviewSummaryCard summary={summaryData} />
        <SessionEventTable events={eventsData} />
      </>
    );
  };

        return (
        <>
          <Navbar />

          <div className="container-fluid dashboard-container">
            <div className="row g-0 dashboard-row">

              <div className="col-md-3 col-lg-2 p-0 dashboard-sidebar-column">
                <Sidebar />
              </div>

              <main className="col-md-9 col-lg-10 bg-light dashboard-main">
                <div className="dashboard-content">

                  <h2 className="fw-bold mb-1">
                    Session Details
                  </h2>

                  <p className="text-muted mb-4">
                    Interview Session: {sessionId}
                  </p>

                  {renderContent()}

                </div>
              </main>

            </div>
          </div>
        </>
        );
}

        export default SessionDetails;