import { useEffect, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import EventTable from "../components/dashboard/EventTable";
import FilterBar from "../components/dashboard/FilterBar";

import { searchEvents } from "../services/interviewService";

function Events() {
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

            <div className="container-fluid dashboard-container">
                <div className="row g-0">
                    <div className="col-md-3 col-lg-2 p-0">
                        <Sidebar />
                    </div>

                    <main className="col-md-9 col-lg-10 bg-light dashboard-main">
                        <div className="dashboard-content">
                            <h2 className="fw-bold">
                                Activity Events
                            </h2>

                            <p className="text-muted mb-4">
                                Search, Filter and Browse Interview Events
                            </p>

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
                    </main>
                </div>
            </div>
        </>
    );
}

export default Events;