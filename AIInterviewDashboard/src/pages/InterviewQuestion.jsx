import { useCallback, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    Col,
    Container,
    Row,
} from "react-bootstrap";

import questions from "../data/questions";

import ProgressBar from "../components/interview/ProgressBar";
import QuestionPlayer from "../components/interview/QuestionPlayer";
import WebcamRecorder from "../components/interview/WebcamRecorder";
import useInterviewActivityTracking from "../hooks/useInterviewActivityTracking";

import { createActivityEvent, uploadRecording, updateSessionStatus } from "../services/interviewService";
import recordingService from "../services/recordingService";

/**
 * Runs the main interview question workflow.
 *
 * Input:
 * - Reads sessionId, candidateId, interviewId, and email from router state.
 *
 * Output:
 * - Renders interview questions, video playback, webcam recording,
 *   activity tracking, recording uploads, and interview completion controls.
 */

function InterviewQuestion() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [replayCounts, setReplayCounts] = useState({});
    const screenShareHandlerRef = useRef(null);
    const isEndingInterviewRef = useRef(false);

    const webcamRef = useRef(null);

    useEffect(() => {
        return () => {
            webcamRef.current?.stopCamera();
            recordingService.setScreenShareEndedHandler(null);
        };
    }, []);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isTabWarningVisible, setIsTabWarningVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSessionUploading, setIsSessionUploading] = useState(false);
    const [isScreenShareLost, setIsScreenShareLost] = useState(false);
    const [isInterviewLocked, setIsInterviewLocked] = useState(false);


    const sessionId = state?.sessionId;
    const candidateId = state?.candidateId;
    const interviewId = state?.interviewId;
    const email = state?.email;

    const currentQuestion = questions[currentQuestionIndex];

    const questionNumber = currentQuestionIndex + 1;

    /**
 * Persists an interview activity event through the activity API.
 *
 * Input:
 * - eventType: Type of activity being recorded.
 * - metadata: Optional event-specific metadata.
 *
 * Output:
 * - Creates the activity event in the backend.
 */

    const logEvent = useCallback(
        async (eventType, metadata = {}) => {
            try {
                await createActivityEvent({
                    sessionId,
                    candidateId,
                    eventType,
                    module: "INTERVIEW",
                    metadataJson: JSON.stringify(metadata),
                });
            } catch (error) {
                console.error(
                    "Event logging failed:",
                    error
                );
            }
        },
        [sessionId, candidateId]
    );

    useInterviewActivityTracking({
        sessionId, candidateId, logEvent,
        onTabSwitch: () => setIsTabWarningVisible(true),
        onTabReturn: () => setIsTabWarningVisible(true),
    });


    if (!state) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    Invalid interview session.
                </Alert>
            </Container>
        );
    }

    /**
 * Starts webcam recording for the candidate's current interview answer.
 *
 * Input:
 * - Uses the current question number and active interview session.
 *
 * Output:
 * - Starts recording, updates recording state, and logs RECORDING_STARTED.
 */

    const handleStartRecording = async () => {
        if (
            isInterviewLocked || isEndingInterviewRef.current
        ) {
            return;
        }

        try {
            if (!webcamRef.current) {
                throw new Error(
                    "Webcam recorder is not available."
                );
            }

            await webcamRef.current.startRecording();

            setIsRecording(true);

            await logEvent(
                "RECORDING_STARTED",
                {
                    questionNumber,
                }
            );
        } catch (error) {
            console.error(
                "Recording start failed:",
                error
            );

            setIsRecording(false);
        }
    };

    /**
 * Stops the current question recording and uploads it to the backend.
 *
 * Input:
 * - Uses the active recording and current question/session information.
 *
 * Output:
 * - Stops recording, uploads the recording, logs recording events,
 *   and returns whether the upload succeeded.
 */

    const handleStopAndUploadRecording = async () => {
        if (!isRecording) {
            return true;
        }

        try {
            setIsUploading(true);

            const blob = await webcamRef.current.stopRecording();

            setIsRecording(false);

            if (!blob || blob.size <= 0) {
                throw new Error(
                    "Recording was empty."
                );
            }

            await logEvent(
                "RECORDING_STOPPED",
                {
                    questionNumber,
                    fileSize: blob.size,
                }
            );

            await uploadRecording({
                sessionId,
                candidateId,
                questionNumber,
                blob,
            });

            await logEvent(
                "RECORDING_UPLOADED",
                {
                    questionNumber,
                    fileSize: blob.size,
                }
            );

            return true;
        } catch (error) {
            console.error(
                "Recording upload failed:",
                error
            );

            return false;
        } finally {
            setIsUploading(false);
        }
    };

    /**
 * Stops and uploads the complete interview session recording.
 *
 * Input:
 * - Uses the active interview session identifiers and session recording state.
 *
 * Output:
 * - Uploads the session recording and logs SESSION_RECORDING_UPLOADED.
 */

    const handleStopAndUploadSessionRecording = async () => {
        try {
            setIsSessionUploading(true);

            const result = await recordingService.stopSessionRecording();

            if (
                !result?.blob ||
                result.blob.size <= 0
            ) {
                throw new Error(
                    "Session recording was empty."
                );
            }

            await recordingService.uploadSessionRecording({
                sessionId,
                candidateId,
                blob: result.blob,
                startedAt: result.startedAt,
                endedAt: result.endedAt,
            });

            await logEvent(
                "SESSION_RECORDING_UPLOADED",
                {
                    fileSize: result.blob.size,
                    startedAt:
                        result.startedAt?.toISOString(),
                    endedAt:
                        result.endedAt?.toISOString(),
                }
            );

            return true;
        } catch (error) {
            console.error(
                "Session recording upload failed:",
                error
            );

            return false;
        } finally {
            setIsSessionUploading(false);
        }
    };

    /**
 * Handles completion of the current question video.
 *
 * Input:
 * - Uses the current question number.
 *
 * Output:
 * - Logs VIDEO_COMPLETED and starts the candidate's recording.
 */

    const handleVideoEnd = async () => {
        await logEvent(
            "VIDEO_COMPLETED",
            {
                questionNumber,
            }
        );

        await handleStartRecording();
    };

    /**
     * Advances to the next interview question or completes the interview.
     *
     * Input:
     * - Uses the current question index, recording state, and session state.
     *
     * Output:
     * - Stops and uploads the active recording, logs completion events,
     *   advances the question index, or navigates to the completion page.
     */
    const handleNextQuestion = async () => {
        if (isInterviewLocked || isEndingInterviewRef.current || isUploading || isSessionUploading) {
            return;
        }

        if (isRecording) {
            const uploaded = await handleStopAndUploadRecording();

            if (!uploaded) {
                return;
            }
        }

        await logEvent(
            "QUESTION_COMPLETED",
            {
                questionNumber,
            }
        );

        await logEvent(
            "NEXT_QUESTION_CLICKED",
            {
                questionNumber,
            }
        );

        if (
            currentQuestionIndex <
            questions.length - 1
        ) {
            setCurrentQuestionIndex(
                (previous) => previous + 1
            );

            return;
        }

        const sessionUploaded = await handleStopAndUploadSessionRecording();

        if (!sessionUploaded) {
            return;
        }

        webcamRef.current?.stopCamera();

        // Last question completed
        await updateSessionStatus({
            sessionId,
            status: "COMPLETED",
        });

        await logEvent(
            "INTERVIEW_COMPLETED",
            {
                totalQuestions: questions.length,
            }
        );

        navigate(
            "/interview/complete",
            {
                state: {
                    sessionId,
                    candidateId,
                    interviewId,
                    email,
                    status: "COMPLETED",
                },
            }
        );
    };

    /**
     * Aborts the interview and navigates to the completion page.
     *
     * Input:
     * - reason: Optional string describing the reason for ending the interview.
     *
     * Output:
     * - Stops and uploads all recordings, updates session status to ABORTED,
     *   logs INTERVIEW_ABORTED, and navigates to the completion page.
     */
    const handleEndInterview = async (reason = "USER_ENDED_INTERVIEW") => {

        if (isEndingInterviewRef.current) {
            return;
        }

        if (isUploading || isSessionUploading) {
            return;
        }

        isEndingInterviewRef.current = true;


        if (isRecording) {
            const uploaded = await handleStopAndUploadRecording();

            if (!uploaded) {
                return;
            }
        }

        const sessionUploaded = await handleStopAndUploadSessionRecording();

        if (!sessionUploaded) {
            isEndingInterviewRef.current = false;
            return;
        }

        webcamRef.current?.stopCamera();

        await updateSessionStatus({
            sessionId,
            status: "ABORTED",
        });

        await logEvent("INTERVIEW_ABORTED",
            {
                questionNumber,
                reason,
            }
        );

        navigate(
            "/interview/complete",
            {
                state: {
                    sessionId,
                    candidateId,
                    interviewId,
                    email,
                    status: "ABORTED",
                },
            }
        );
    };

    /**
     * Handles screen sharing being stopped by the candidate.
     *
     * Input:
     * - No direct parameters. Uses the current screen share and interview state.
     *
     * Output:
     * - Locks the interview, logs SCREEN_SHARE_ENDED, and ends the interview.
     */
    const handleScreenShareEnded = async () => {
        if (isScreenShareLost || isEndingInterviewRef.current) {
            return;
        }
        setIsScreenShareLost(true);
        setIsInterviewLocked(true);

        await logEvent(
            "SCREEN_SHARE_ENDED",
            {
                reason: "Screen sharing was stopped by the candidate.",
                questionNumber,
                timestamp: new Date().toISOString(),
            }
        );

        await handleEndInterview("SCREEN_SHARE_STOPPED_BY_USER");
    };

    useEffect(() => {
        screenShareHandlerRef.current = handleScreenShareEnded;
    });

    useEffect(() => {
        recordingService.setScreenShareEndedHandler(
            () => screenShareHandlerRef.current?.()
        );

        return () => {
            recordingService.setScreenShareEndedHandler(null);
        };
    }, []);

    return (
        <Container
            fluid
            className="py-4"
        >

            <Row className="justify-content-center">

                <Col lg={10}>

                    {isTabWarningVisible && (
                        <Alert
                            variant="warning"
                            className="shadow-sm"
                            dismissible
                            onClose={() => setIsTabWarningVisible(false)}
                        >
                            <Alert.Heading className="h6">
                                Interview Warning
                            </Alert.Heading>

                            <p className="mb-0">
                                You have switched away from the interview.
                                This activity has been recorded.
                            </p>
                        </Alert>
                    )}

                    <ProgressBar
                        currentQuestion={
                            questionNumber
                        }
                        totalQuestions={
                            questions.length
                        }
                    />

                    <Row>

                        <Col lg={8}>

                            <QuestionPlayer
                                question={currentQuestion}
                                questionNumber={questionNumber}
                                onNextQuestion={handleNextQuestion}
                                onVideoEnd={handleVideoEnd}
                                logEvent={logEvent}
                                onQuestionReplay={() => {
                                    const count = (replayCounts[questionNumber] || 0) + 1;
                                    setReplayCounts((previous) => ({
                                        ...previous, [questionNumber]: count,
                                    }));

                                    logEvent("QUESTION_REPLAYED", {
                                        questionNumber,
                                        replayCount: count,
                                        timestamp: new Date().toISOString()
                                    });
                                }}
                                isBusy={isInterviewLocked || isUploading || isSessionUploading}
                                isRecording={isRecording}
                                replayCount={
                                    replayCounts[questionNumber] || 0
                                }
                                maxReplays={2}
                            />

                        </Col>

                        <Col lg={4}>

                            <Card className="shadow-sm border-0">

                                <Card.Header>
                                    Webcam Preview
                                </Card.Header>

                                <Card.Body>

                                    <WebcamRecorder
                                        ref={
                                            webcamRef
                                        }
                                    />

                                    <div className="text-center mt-3">

                                        {isRecording && (
                                            <span className="text-danger fw-semibold">
                                                ● Recording
                                            </span>
                                        )}

                                        {isUploading && (
                                            <span className="text-primary fw-semibold">
                                                Uploading recording...
                                            </span>
                                        )}

                                        {!isRecording &&
                                            !isUploading && (
                                                <span className="text-muted">
                                                    Waiting for answer...
                                                </span>
                                            )}

                                    </div>

                                </Card.Body>

                            </Card>

                        </Col>

                    </Row>

                    <div className="text-end mt-4">

                        <Button
                            variant="danger"
                            onClick={
                                handleEndInterview
                            }
                            disabled={
                                isInterviewLocked || isUploading || isSessionUploading
                            }
                        >
                            End Interview
                        </Button>

                    </div>

                </Col>

            </Row>

        </Container>
    );
}

export default InterviewQuestion;