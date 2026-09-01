import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Activity, Clock, Video } from "lucide-react";

/**
 * Vertical navigation sidebar used on dashboard and session pages.
 *
 * Output:
 * - Renders navigation links for Dashboard, Events, Sessions, and Mock Interview.
 * - Active links are automatically highlighted via NavLink.
 */
function Sidebar() {
    return (
        <div className="sidebar bg-dark text-white p-3 h-100 d-flex flex-column" style={{ background: "linear-gradient(180deg, #0d1117 0%, #11171d 100%)" }}>
            <style>{`

                .sidebar-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 14px; 
                    padding: 0.6rem 1rem;
                    color: #fff !important; 
                    text-decoration: none;
                    font-size: 0.95rem;
                    border-left: 3px solid transparent;
                    transition: background 0.2s, color 0.2s, border-left 0.2s;
                }
                .sidebar-nav-link svg {
                    color: #fff !important;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                .sidebar .sidebar-nav-link,
                .sidebar .sidebar-nav-link.active-link,
                .sidebar .nav-link {
                        color: #fff !important;
                }

                .sidebar-nav-link.active-link {
                    background: rgba(13,110,253,0.15);
                    border-left-color: #0d6efd;
                    font-weight: 600;
                }
                
                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 1rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                    color: #fff;
                }
                .brand-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }
            `}</style>

            <Nav className="flex-column">
                <Nav.Link
                    as={NavLink}
                    to="/"
                    end
                    className={({ isActive }) => "sidebar-nav-link" + (isActive ? " active-link" : "")}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/events"
                    className={({ isActive }) => "sidebar-nav-link" + (isActive ? " active-link" : "")}
                >
                    <Activity size={18} />
                    Events
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/sessions"
                    className={({ isActive }) => "sidebar-nav-link" + (isActive ? " active-link" : "")}
                >
                    <Clock size={18} />
                    Sessions
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/interview"
                    className={({ isActive }) => "sidebar-nav-link" + (isActive ? " active-link" : "")}
                >
                    <Video size={18} />
                    Mock Interview
                </Nav.Link>
            </Nav>
            <div className="mt-auto pt-3 border-top border-secondary-subtle" style={{ opacity: 0.4 }}>
                <p className="small mb-0 text-muted px-2" style={{ fontSize: "0.75rem" }}>AI Interview Tracker</p>
            </div>
        </div>
    );
}

export default Sidebar;