import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import SessionInfo from "../components/session/SessionInfo";
import SessionEventTable from "../components/session/SessionEventTable";

import {
  getSessionById,
  getSessionEvents,
} from "../services/interviewService";

/**
 * Displays session information and activity events
 * retrieved from the backend for the selected interview session.
 */
function SessionDetails() {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const session = sessionResponse?.data ?? sessionResponse;
        const events = eventsResponse?.data ?? eventsResponse;

        setSessionData(session ?? null);
        setEventsData(Array.isArray(events) ? events : []);
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