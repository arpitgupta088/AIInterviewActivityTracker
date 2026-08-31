import apiClient from "./apiClient";
import { EventQueue } from "./eventQueue";

const ActivityTracker = (() => {
    let eventQueue = null;

    let currentSessionId = null;
    let currentCandidateId = null;

    let isInitialized = false;

    const handlePageHide = () => {
        if (!eventQueue) {
            return;
        }

        eventQueue.addEvent(
            currentSessionId,
            currentCandidateId,
            "PAGE_UNLOAD",
            "BROWSER_LIFECYCLE",
            JSON.stringify({
                reason: "PAGE_HIDE",
                timestamp: new Date().toISOString(),
            })
        );

        eventQueue.flushWithBeacon();
    };

    const handleApplicationError = (event) => {
        if (!currentSessionId || !currentCandidateId) {
            return;
        }

        ActivityTracker.trackEvent(
            currentSessionId,
            currentCandidateId,
            "APPLICATION_ERROR",
            "ERROR",
            JSON.stringify({
                message:
                    event.message ||
                    "Unknown JavaScript error",

                filename:
                    event.filename || "",

                lineNumber:
                    event.lineno || null,

                columnNumber:
                    event.colno || null,

                timestamp:
                    new Date().toISOString(),
            })
        );
    };

    const handleUnhandledPromiseRejection = (event) => {
        if (!currentSessionId || !currentCandidateId) {
            return;
        }

        ActivityTracker.trackEvent(
            currentSessionId,
            currentCandidateId,
            "UNHANDLED_PROMISE_REJECTION",
            "ERROR",
            JSON.stringify({
                reason:
                    event.reason?.message ||
                    String(
                        event.reason ||
                        "Unknown promise rejection"
                    ),

                timestamp:
                    new Date().toISOString(),
            })
        );
    };


    const initialize = (sessionId, candidateId) => {
        if (!sessionId?.trim() || !candidateId?.trim()) {
            return;
        }

        currentSessionId = sessionId.trim();
        currentCandidateId = candidateId.trim();

        if (isInitialized) {
            return;
        }

        eventQueue = new EventQueue(
            apiClient,
            10
        );

        window.addEventListener(
            "pagehide",
            handlePageHide
        );

        window.addEventListener(
            "error",
            handleApplicationError
        );

        window.addEventListener(
            "unhandledrejection",
            handleUnhandledPromiseRejection
        );

        isInitialized = true;

        ActivityTracker.trackEvent(
            currentSessionId,
            currentCandidateId,
            "PAGE_LOAD",
            "BROWSER_LIFECYCLE",
            JSON.stringify({
                timestamp: new Date().toISOString(),
            })
        );

        if (navigator.onLine) {
            eventQueue.flush();
        }
    };

    const trackEvent = (
        sessionId,
        candidateId,
        eventType,
        module = "",
        metadataJson = "{}"
    ) => {
        initialize(sessionId, candidateId);

        if (!eventQueue) {
            return;
        }

        eventQueue.addEvent(
            sessionId,
            candidateId,
            eventType,
            module,
            metadataJson
        );

    };

    const flush = () => {
        if (!eventQueue) {
            return;
        }

        eventQueue.flushWithBeacon();
    };

    return {
        trackEvent,
        flush,
    };
})();

export default ActivityTracker;