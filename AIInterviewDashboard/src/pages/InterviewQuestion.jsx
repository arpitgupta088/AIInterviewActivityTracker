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

function InterviewQuestion() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const webcamRef = useRef(null);

    useEffect(() => {
        return () => {
            webcamRef.current?.stopCamera();
        };
    }, []);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isTabWarningVisible, setIsTabWarningVisible] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    if (!state) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    Invalid interview session.
                </Alert>
            </Container>
        );
    }

    const {
        sessionId,
        candidateId,
        interviewId,
        email,
    } = state;

    const currentQuestion = questions[currentQuestionIndex];

    const questionNumber = currentQuestionIndex + 1;

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

    const handleStartRecording = async () => {
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

    const handleVideoEnd = async () => {
        await logEvent(
            "VIDEO_COMPLETED",
            {
                questionNumber,
            }
        );

        await handleStartRecording();
    };

    const handleNextQuestion = async () => {
        if (isUploading) {
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

    const handleEndInterview = async () => {
        if (isUploading) {
            return;
        }

        if (isRecording) {
            const uploaded = await handleStopAndUploadRecording();

            if (!uploaded) {
                return;
            }
        }

        webcamRef.current?.stopCamera();

        await updateSessionStatus({
            sessionId,
            status: "ABORTED",
        });

        await logEvent(
            "INTERVIEW_ABORTED",
            {
                questionNumber,
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
                                onNextQuestion={handleNextQuestion}
                                onVideoEnd={handleVideoEnd}
                                isBusy={isUploading}
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
                                isUploading
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