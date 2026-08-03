import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

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

            </Nav>
        </div>
    );
}

export default Sidebar;