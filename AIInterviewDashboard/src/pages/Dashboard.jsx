import React, { useEffect, useState } from "react";
import { Row, Col, Alert, Container, Offcanvas } from "react-bootstrap";
import { Menu } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import StatsCard from "../components/dashboard/StatsCard";
import FilterBar from "../components/dashboard/FilterBar";
import EventTable from "../components/dashboard/EventTable";
import ActivityChart from "../components/dashboard/ActivityChart";
import SessionSummary from "../components/dashboard/SessionSummary";

import {
    getDashboardStats,
    getRecentEvents,
} from "../services/dashboardService";

/**
 * Displays the main interview monitoring dashboard.
 *
 * Input:
 * - No direct props.
 *
 * Output:
 * - Renders dashboard statistics, recent activity events,
 *   activity chart, filters, and session summary.
 */

function Dashboard() {
    // Responsive sidebar state
    const [showSidebar, setShowSidebar] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("ALL");

    // Dashboard API states
    const [stats, setStats] = useState({
        totalSessions: 0,
        activeSessions: 0,
        totalEvents: 0,
    });

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

    /**
    * Loads dashboard statistics and recent activity events from the backend.
    *
    * Input:
    * - No input parameters.
    *
    * Output:
    * - Updates dashboard statistics, activity events, loading state,
    *   and error state.
    */
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [statsResponse, eventsResponse] = await Promise.all([
                    getDashboardStats(),
                    getRecentEvents(10),
                ]);

                setStats(
                    statsResponse?.data ?? {
                        totalSessions: 0,
                        activeSessions: 0,
                        totalEvents: 0,
                    }
                );

                setEvents(
                    Array.isArray(eventsResponse?.data)
                        ? eventsResponse.data
                        : []
                );
            } catch (err) {
                console.error("Failed to load dashboard data:", err);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

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
                    {/* Sidebar */}
                    <Col md={3} lg={2} className="d-none d-md-block bg-dark border-end">
                        <Sidebar />
                    </Col>

                    {/* Main Content Area */}
                    <Col xs={12} md={9} lg={10} className="bg-light dashboard-main">
                        <div className="dashboard-content">
                            {/* Header */}
                            <div className="mb-4 d-flex align-items-center justify-content-between">
                                <div>
                                    <h2 className="fw-bold mb-1 fs-3 fs-md-2">Dashboard</h2>
                                    <p className="text-muted mb-0 small">
                                        AI Interview Activity Tracker
                                    </p>
                                </div>
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

                            {/* Statistics Cards Grid */}
                            <Row className="g-2 g-sm-3 mb-4">
                                <Col xs={12} sm={6} lg={3}>
                                    <StatsCard
                                        title="Active Sessions"
                                        value={loading ? "..." : stats.activeSessions}
                                    />
                                </Col>

                                <Col xs={12} sm={6} lg={3}>
                                    <StatsCard
                                        title="Total Sessions"
                                        value={loading ? "..." : stats.totalSessions}
                                    />
                                </Col>

                                <Col xs={12} sm={6} lg={3}>
                                    <StatsCard
                                        title="Total Events"
                                        value={loading ? "..." : stats.totalEvents}
                                    />
                                </Col>

                                <Col xs={12} sm={6} lg={3}>
                                    <StatsCard
                                        title="Recent Events"
                                        value={loading ? "..." : events.length}
                                    />
                                </Col>
                            </Row>

                            {/* Analytics Section (Chart & Summary) */}
                            <Row className="g-3 mb-4">
                                <Col xs={12} lg={8}>
                                    <div className="bg-white p-3 rounded shadow-sm h-100">
                                        <ActivityChart events={events} />
                                    </div>
                                </Col>

                                <Col xs={12} lg={4}>
                                    <div className="bg-white p-3 rounded shadow-sm h-100">
                                        <SessionSummary
                                            totalSessions={stats.totalSessions}
                                            activeSessions={stats.activeSessions}
                                            recentEventsCount={events.length}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            {/* Filters */}
                            <div className="mb-3">
                                <FilterBar
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    selectedEvent={selectedEvent}
                                    setSelectedEvent={setSelectedEvent}
                                />
                            </div>

                            {/* Events Table */}
                            <Row>
                                <Col xs={12}>
                                    <div className="bg-white rounded shadow-sm p-2 p-md-3">
                                        <EventTable
                                            events={events}
                                            searchTerm={searchTerm}
                                            selectedEvent={selectedEvent}
                                            loading={loading}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Dashboard;