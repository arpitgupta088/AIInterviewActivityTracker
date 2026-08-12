import { useEffect, useRef } from "react";
import { Alert, Button, Card } from "react-bootstrap";

function QuestionPlayer({
    question,
    onNextQuestion,
    onVideoEnd,
    isBusy = false,
}) {
    const videoRef = useRef(null);
    const hasEndedRef = useRef(false);

    useEffect(() => {
        hasEndedRef.current = false;
    }, [question?.video]);

    if (!question) {
        return (
            <Alert variant="warning">
                Question not available.
            </Alert>
        );
    }

    const handleVideoEnded = async () => {
        if (hasEndedRef.current) {
            return;
        }

        hasEndedRef.current = true;

        if (onVideoEnd) {
            await onVideoEnd();
        }
    };

    return (
        <Card className="shadow-sm border-0 mb-4">

            <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">
                    {question.title}
                </h5>
            </Card.Header>

            <Card.Body>

                <video
                    key={question.video}
                    ref={videoRef}
                    className="w-100 rounded mb-3"
                    controls
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                >
                    <source
                        src={question.video}
                        type="video/mp4"
                    />

                    Your browser does not support HTML5 video.
                </video>

                <div className="d-flex justify-content-end">

                    <Button
                        variant="primary"
                        onClick={onNextQuestion}
                        disabled={isBusy}
                    >
                        {isBusy ? "Saving Recording..." : "Next Question"}
                    </Button>

                </div>

            </Card.Body>

        </Card>
    );
}

export default QuestionPlayer;