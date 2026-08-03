import { Card } from "react-bootstrap";

function StatsCard({ title, value }) {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <h3>{value}</h3>
      </Card.Body>
    </Card>
  );
}

export default StatsCard;