import { useEffect, useState } from "react";
import { Alert, Col, Container, Offcanvas, Row, Spinner } from "react-bootstrap";
import { Menu } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import EventTable from "../components/dashboard/EventTable";
import FilterBar from "../components/dashboard/FilterBar";

import { searchEvents } from "../services/interviewService";

/**
 * Displays searchable and filterable interview activity events.
 *
 * Input:
 * - No direct props.
 *
 * Output:
 * - Renders activity events with search, event-type filtering,
 *   loading state, error handling, and pagination.
 */
function Events() {
    // Responsive sidebar state for mobile offcanvas
    const [showSidebar, setShowSidebar] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("ALL");

    useEffect(() => {
        loadEvents();
    }, [page, searchTerm, selectedEvent]);

    /**
     * Loads paginated and filtered activity events from the backend.
     *
     * Input:
     * - Uses the current page, pageSize, searchTerm, and selectedEvent state.
     *
     * Output:
     * - Updates events, totalPages, loading, and error state.
     */
    async function loadEvents() {
        try {
            setLoading(true);
            setError("");

            const response = await searchEvents({
                page,
                pageSize,
                sessionId:
                    searchTerm.trim() === ""
                        ? undefined
                        : searchTerm.trim(),
                eventType:
                    selectedEvent === "ALL"
                        ? undefined
                        : selectedEvent,
            });

            const result = response.data;

            setEvents(result.events);

            setTotalPages(Math.ceil(result.totalCount / result.pageSize));
        }
        catch {
            setError("Unable to load events.");
        }
        finally {
            setLoading(false);
        }
    }

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
                                        Activity Events
                                    </h2>
                                    <p className="text-muted mb-0 small">
                                        Search, Filter and Browse Interview Events
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

                            {error && (
                                <Alert variant="danger">
                                    {error}
                                </Alert>
                            )}

                            <FilterBar
                                searchTerm={searchTerm}
                                setSearchTerm={(value) => {
                                    setPage(1);
                                    setSearchTerm(value);
                                }}
                                selectedEvent={selectedEvent}
                                setSelectedEvent={(value) => {
                                    setPage(1);
                                    setSelectedEvent(value);
                                }}
                            />

                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <>
                                    <EventTable
                                        events={events}
                                        loading={loading}
                                    />

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
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((previous) => previous + 1)}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Events;