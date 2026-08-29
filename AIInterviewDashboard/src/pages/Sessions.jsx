import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Card, Col, Container, Offcanvas, Row, Spinner, Table } from "react-bootstrap";
import { Menu } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import { getAllSessions } from "../services/interviewService";

/**
 * Displays all interview sessions retrieved from the backend.
 *
 * Input:
 * - No direct props.
 *
 * Output:
 * - Renders a table of all sessions with links to their detail pages.
 */
function Sessions() {
    // Responsive sidebar state for mobile offcanvas
    const [showSidebar, setShowSidebar] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadSessions();
    }, [page]);

    /**
     * Loads interview sessions for the currently selected page.
     *
     * Input:
     * - Uses the current page number and page size from component state.
     *
     * Output:
     * - Updates sessions, total count, loading state, and error state.
     */
    const loadSessions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllSessions(page, pageSize);

            const data = response?.data ?? response;

            setSessions(Array.isArray(data?.sessions) ? data.sessions : []);

            setTotalCount(Number.isInteger(data?.totalCount) ? data.totalCount : 0);
        }
        catch (err) {
            console.error(err);

            setError("Unable to load interview sessions.");
        }
        finally {
            setLoading(false);
        }
    };

    /**
     * Formats an ISO date string into the user's local date and time.
     *
     * Input:
     * - date: ISO date string or null.
     *
     * Output:
     * - Returns a formatted date string, or "N/A" when the date is absent.
     */
    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString();
    };

    const totalPages = Math.ceil(
        totalCount / pageSize
    );

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
                                        Interview Sessions
                                    </h2>
                                    <p className="text-muted mb-0 small">
                                        Browse all interview sessions.
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

                            {/* API Error Alert */}
                            {error && (
                                <Alert variant="danger" className="mb-4">
                                    {error}
                                </Alert>
                            )}

                            <Card className="shadow-sm">

                                <Card.Body className="p-0">

                                    {loading ? (

                                        <div className="text-center py-5">
                                            <Spinner animation="border" />
                                        </div>

                                    ) : (

                                        <div className="table-responsive">

                                            <Table hover className="mb-0">

                                                <thead className="table-light">

                                                    <tr>
                                                        <th>Session ID</th>
                                                        <th>Candidate</th>
                                                        <th>Interview</th>
                                                        <th>Status</th>
                                                        <th>Start Time</th>
                                                    </tr>

                                                </thead>

                                                <tbody>

                                                    {sessions.length > 0 ? (

                                                        sessions.map((session) => (

                                                            <tr key={`${session.sessionId}-${session.candidateId}-${session.startTime}`}>

                                                                <td>

                                                                    <Link
                                                                        to={`/sessions/${session.sessionId}`}
                                                                    >
                                                                        {session.sessionId}
                                                                    </Link>

                                                                </td>

                                                                <td>
                                                                    {session.candidateId}
                                                                </td>

                                                                <td>
                                                                    {session.interviewId}
                                                                </td>

                                                                <td>
                                                                    {session.status}
                                                                </td>

                                                                <td>
                                                                    {formatDate(session.startTime)}
                                                                </td>

                                                            </tr>

                                                        ))

                                                    ) : (

                                                        <tr>

                                                            <td
                                                                colSpan={5}
                                                                className="text-center py-4"
                                                            >
                                                                No interview sessions found.
                                                            </td>

                                                        </tr>

                                                    )}

                                                </tbody>

                                            </Table>


                                        </div>

                                    )}

                                </Card.Body>

                            </Card>

                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <button
                                    className="btn btn-outline-primary"
                                    disabled={page === 1}
                                    onClick={() => setPage((previous) => previous - 1)}
                                >
                                    Previous
                                </button>

                                <span className="fw-semibold">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    className="btn btn-outline-primary"
                                    disabled={page >= totalPages || totalPages === 0}
                                    onClick={() => setPage((previous) => previous + 1)}
                                >
                                    Next
                                </button>
                            </div>

                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Sessions;