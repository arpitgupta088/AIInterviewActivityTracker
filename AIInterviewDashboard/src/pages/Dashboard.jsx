import React, { useEffect, useState } from "react";
import { Row, Col, Alert } from "react-bootstrap";

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

function Dashboard() {
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

            <div className="container-fluid dashboard-container">
                <div className="row g-0 dashboard-row">

                    <div className="col-md-3 col-lg-2 p-0 dashboard-sidebar-column">
                        <Sidebar />
                    </div>

                    <main className="col-md-9 col-lg-10 bg-light dashboard-main">
                        <div className="dashboard-content">

                            {/* Header */}
                            <h2 className="fw-bold mb-1">
                                Dashboard
                            </h2>

                            <p className="text-muted mb-4">
                                AI Interview Activity Tracker
                            </p>

                            {/* API Error */}
                            {error && (
                                <Alert variant="danger">
                                    {error}
                                </Alert>
                            )}

                            {/* Statistics */}
                            <Row className="g-3 mb-4">
                                <Col xs={12} sm={6} xl={3}>
                                    <StatsCard
                                        title="Active Sessions"
                                        value={
                                            loading
                                                ? "..."
                                                : stats.activeSessions
                                        }
                                    />
                                </Col>

                                <Col xs={12} sm={6} xl={3}>
                                    <StatsCard
                                        title="Total Sessions"
                                        value={
                                            loading
                                                ? "..."
                                                : stats.totalSessions
                                        }
                                    />
                                </Col>

                                <Col xs={12} sm={6} xl={3}>
                                    <StatsCard
                                        title="Total Events"
                                        value={
                                            loading
                                                ? "..."
                                                : stats.totalEvents
                                        }
                                    />
                                </Col>

                                <Col xs={12} sm={6} xl={3}>
                                    <StatsCard
                                        title="Recent Events"
                                        value={
                                            loading
                                                ? "..."
                                                : events.length
                                        }
                                    />
                                </Col>
                            </Row>

                            {/* Analytics */}
                            <Row className="g-3 mb-4">
                                <Col xs={12} lg={8}>
                                    <ActivityChart events={events} />
                                </Col>

                                <Col xs={12} lg={4}>
                                    <SessionSummary
                                        totalSessions={stats.totalSessions}
                                        activeSessions={stats.activeSessions}
                                        recentEventsCount={events.length}
                                    />
                                </Col>
                            </Row>

                            {/* Filters */}
                            <FilterBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                selectedEvent={selectedEvent}
                                setSelectedEvent={setSelectedEvent}
                            />

                            {/* Recent Events */}
                            <Row>
                                <Col xs={12}>
                                    <EventTable
                                        events={events}
                                        searchTerm={searchTerm}
                                        selectedEvent={selectedEvent}
                                        loading={loading}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </main>

                </div>
            </div>
        </>
    );
}

export default Dashboard;