import { Card } from "react-bootstrap";

/**
 * Displays a single dashboard statistic.
 *
 * Input:
 * - title: Label displayed for the statistic.
 * - value: Value displayed below the label.
 *
 * Output:
 * - Renders a dashboard statistic card.
 */

function StatsCard({ title, value }) {
  return (
    <Card className="shadow-sm border-0 border-start border-4 border-primary h-100">
      <Card.Body className="py-3">
        <Card.Title className="text-muted fw-normal fs-6 mb-1">{title}</Card.Title>
        <h3 className="fw-bold mb-0 text-dark">{value}</h3>
      </Card.Body>
    </Card>
  );
}

export default StatsCard;