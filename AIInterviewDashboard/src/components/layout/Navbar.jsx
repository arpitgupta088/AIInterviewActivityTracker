import { Navbar, Container } from "react-bootstrap";

/**
 * Top navigation bar displayed on every dashboard and admin page.
 *
 * Output:
 * - Renders a dark Bootstrap Navbar with the application brand name.
 */
function TopNavbar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Container fluid>
        <Navbar.Brand>
          AI Interview Dashboard
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;