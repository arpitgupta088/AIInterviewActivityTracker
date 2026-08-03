import { Navbar, Container } from "react-bootstrap";

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