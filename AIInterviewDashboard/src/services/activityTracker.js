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

        isInitialized = true;
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