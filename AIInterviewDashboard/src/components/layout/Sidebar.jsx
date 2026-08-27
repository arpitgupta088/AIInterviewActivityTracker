import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

/**
 * Vertical navigation sidebar used on dashboard and session pages.
 *
 * Output:
 * - Renders navigation links for Dashboard, Events, Sessions, and Mock Interview.
 * - Active links are automatically highlighted via NavLink.
 */
function Sidebar() {
    return (
        <div className="sidebar bg-dark text-white p-3 h-100">
            <h5 className="mb-4">Menu</h5>

            <Nav className="flex-column">

                <Nav.Link
                    as={NavLink}
                    to="/"
                    end
                    className="text-white"
                >
                    Dashboard
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/events"
                    className="text-white"
                >
                    Events
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/sessions"
                    className="text-white"
                >
                    Sessions
                </Nav.Link>

                <Nav.Link
                    as={NavLink}
                    to="/interview"
                    className="text-white"
                >
                    Mock Interview
                </Nav.Link>

            </Nav>
        </div>
    );
}

export default Sidebar;