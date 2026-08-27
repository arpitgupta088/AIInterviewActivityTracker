/**
 * Displays an interview question video and provides replay and
 * next-question controls.
 *
 * Input:
 * - question: Current interview question and video information.
 * - questionNumber: Current question number.
 * - onNextQuestion: Callback invoked when the candidate proceeds.
 * - onVideoEnd: Callback invoked when the question video completes.
 * - onQuestionReplay: Callback invoked when the video is replayed.
 * - logEvent: Callback used to record activity events.
 *
 * Output:
 * - Renders the question video, playback error information,
 *   replay control, and next-question control.
 */

import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card } from "react-bootstrap";

function QuestionPlayer({
    question,
    questionNumber,
    onNextQuestion,
    onVideoEnd,
    onQuestionReplay,
    logEvent,
    isBusy = false,
    isRecording = false,
    maxReplays = 2,
    replayCount = 0,
}) {
    const videoRef = useRef(null);
    const hasEndedRef = useRef(false);
    const [videoError, setVideoError] = useState("");

    useEffect(() => {
        hasEndedRef.current = false;
        setVideoError("");
    }, [question?.video]);

    if (!question) {
        return (
            <Alert variant="warning">
                Question not available.
            </Alert>
        );
    }

    /**
     * Replays the current question video from the beginning.
     *
     * Input:
     * - No explicit parameters. Uses current videoRef, isBusy, isRecording, and replayCount.
     *
     * Output:
     * - Resets the video to the start, plays it, and invokes onQuestionReplay.
     */
    const handleReplayQuestion = () => {
        if (!videoRef.current || isBusy || isRecording || replayCount >= maxReplays) {
            return;
        }

        hasEndedRef.current = false;
        videoRef.current.currentTime = 0;

        const playPromise = videoRef.current.play();

        if (playPromise) {
            playPromise.catch(async (error) => {
                console.error("Question replay failed", error)

                await logEvent?.("VIDEO_PLAYBACK_FAILED", {
                    questionNumber,
                    videoName: question?.video?.split("/").pop() ?? "unknown",
                    videoUrl: question?.video,
                    reason: error?.message || "Video replay failed",
                    action: "REPLAY",
                    errorMessage: error?.message ?? "Unknown playback error",
                    timestamp: new Date().toISOString(),
                });
            });
        }

        if (onQuestionReplay) {
            onQuestionReplay();
        }
    };

    /**
     * Handles the question video ending naturally.
     *
     * Input:
     * - No explicit parameters.
     *
     * Output:
     * - Invokes the onVideoEnd callback once when the video finishes.
     */
    const handleVideoEnded = async () => {
        if (hasEndedRef.current) {
            return;
        }

        hasEndedRef.current = true;

        if (onVideoEnd) {
            await onVideoEnd();
        }
    };

    /**
     * Handles video element playback errors.
     *
     * Input:
     * - event: The native HTML video error event.
     *
     * Output:
     * - Sets a user-facing error message and logs VIDEO_PLAYBACK_FAILED.
     */
    const handleVideoError = async (event) => {
        const video = event.currentTarget;
        const videoName = question?.video?.split("/").pop() ?? "unknown";

        const errorCode = video.error?.code ?? null;

        const errorReasons = {
            1: "Video playback was aborted.",
            2: "Network error while loading the video.",
            3: "Video could not be decoded.",
            4: "Video format or source is not supported.",
        };

        const reason =
            errorReasons[errorCode] ??
            "Unknown video playback error.";

        setVideoError(reason);

        await logEvent?.(
            "VIDEO_PLAYBACK_FAILED",
            {
                questionNumber,
                videoName,
                videoUrl: question?.video,
                reason,
                errorCode,
                browserMessage: video.error?.message ?? "No browser error message available.",
                errorMessage: video.error?.message || "Unknown video playback error",
                networkState: video.networkState,
                readyState: video.readyState,
                timestamp: new Date().toISOString(),
            }
        );
    };

    return (
        <Card className="shadow-sm border-0 mb-4">

            <Card.Header className="bg-white">
                <h5 className="mb-0 fw-bold">
                    {question.title}
                </h5>
            </Card.Header>

            <Card.Body>

                {videoError && (
                    <Alert variant="danger">
                        <strong>Video Playback Failed:</strong>{" "}
                        {videoError}
                    </Alert>
                )}

                <video
                    key={question.video}
                    ref={videoRef}
                    className="w-100 rounded mb-3"
                    controls
                    autoPlay
                    playsInline
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                >
                    <source
                        src={question.video}
                        type="video/mp4"
                    />

                    Your browser does not support HTML5 video.
                </video>

                <div className="d-flex justify-content-between">

                    <Button
                        variant="outline-secondary"
                        onClick={handleReplayQuestion}
                        disabled={isBusy || isRecording || replayCount >= maxReplays}
                    >
                        {replayCount >= maxReplays
                            ? "Replay Limit reached" : `Replay Question (${maxReplays - replayCount} left)`}
                    </Button>

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