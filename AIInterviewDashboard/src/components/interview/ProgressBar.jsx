import { Card, ProgressBar as BootstrapProgressBar } from "react-bootstrap";

/**
 * Displays the candidate's current interview progress.
 *
 * Input:
 * - currentQuestion: Current question number.
 * - totalQuestions: Total number of interview questions.
 *
 * Output:
 * - Renders a progress bar showing interview completion percentage.
 */

function ProgressBar({
  currentQuestion,
  totalQuestions,
}) {
  const progress =
    totalQuestions > 0
      ? (currentQuestion / totalQuestions) * 100
      : 0;

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Body>

        <div className="d-flex justify-content-between align-items-center mb-2">

          <h6 className="mb-0 fw-bold">
            Interview Progress
          </h6>

          <span className="text-muted">
            Question {currentQuestion} of {totalQuestions}
          </span>

        </div>

        <BootstrapProgressBar
          now={progress}
          animated
          striped
          label={`${Math.round(progress)}%`}
        />

      </Card.Body>
    </Card>
  );
}

export default ProgressBar;