import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Card, Spinner, Table } from "react-bootstrap";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import { getAllSessions } from "../services/interviewService";

function Sessions() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllSessions();

            const data = response?.data ?? response;

            setSessions(Array.isArray(data) ? data : []);
        }
        catch (err) {
            console.error(err);

            setError("Unable to load interview sessions.");
        }
        finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString();
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

                            <h2 className="fw-bold">
                                Interview Sessions
                            </h2>

                            <p className="text-muted mb-4">
                                Browse all interview sessions.
                            </p>

                            {error && (
                                <Alert variant="danger">
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

                                                            <tr key={session.sessionId}>

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

                        </div>

                    </main>

                </div>
            </div>
        </>
    );
}

export default Sessions;