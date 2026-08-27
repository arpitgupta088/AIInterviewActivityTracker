import { ApiClient } from "./apiClient.js";
import { BeaconTracker } from "./beaconTracker.js";
import { EventQueue } from "./eventQueue.js";

const ActivityTracker = (() => {
    let apiClient = null;
    let beaconTracker = null;
    let eventQueue = null;

    let currentSessionId = null;
    let currentCandidateId = null;

    /**
     * Initializes the activity tracker.
     */
    function init(baseUrl, sessionId, candidateId) {

        if (
            !baseUrl?.trim() ||
            !sessionId?.trim() ||
            !candidateId?.trim()
        ) {
            console.error("[ActivityTracker] Invalid initialization parameters.");
            return;
        }

        currentSessionId = sessionId.trim();
        currentCandidateId = candidateId.trim();

        apiClient = new ApiClient(baseUrl);
        beaconTracker = new BeaconTracker(baseUrl);

        eventQueue = new EventQueue(         ///    queue created
            apiClient,
            beaconTracker,
            10);

        console.log("[ActivityTracker] Initialized.");

        registerBrowserEvents();

        trackEvent("PAGE_LOAD", "BROWSER_LIFECYCLE");
    }

    /**
     * Registers browser lifecycle events.
     */
    function registerBrowserEvents() {

        document.addEventListener("visibilitychange", () => {

            if (document.hidden) {
                trackEvent("TAB_HIDDEN", "BROWSER_LIFECYCLE");
            }
            else {
                trackEvent("TAB_VISIBLE", "BROWSER_LIFECYCLE");
            }

        });

        window.addEventListener("blur", () => {
            trackEvent("WINDOW_BLUR", "BROWSER_LIFECYCLE");
        });

        window.addEventListener("focus", () => {
            trackEvent("WINDOW_FOCUS", "BROWSER_LIFECYCLE");
        });

        window.addEventListener("pagehide", () => {

            trackEvent("PAGE_UNLOAD", "BROWSER_LIFECYCLE");

            if (eventQueue) {
                eventQueue.flushWithBeacon();
            }

        })

        window.addEventListener("online", () => {

            console.log("[ActivityTracker] Network restored.");

            if (eventQueue) {
                eventQueue.flush();
            }

        });

        window.addEventListener("error", (event) => {
            trackEvent("APPLICATION_ERROR", "ERROR", {
                message: event.message || "Unknown JavaScript error",
                filename: event.filename || "",
                lineNumber: event.lineno || null,
                columnNumber: event.colno || null,
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener("unhandledrejection", (event) => {
            trackEvent("UNHANDLED_PROMISE_REJECTION", "ERROR", {
                reason: event.reason?.message || String(event.reason || "Unknown promise rejection"),
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Tracks a browser activity event.
     */
    function trackEvent(
        eventType,
        module = "",
        metadata = {}) {

        if (!eventQueue) {
            console.warn("[ActivityTracker] Tracker is not initialized.");
            return;
        }

        eventQueue.addEvent(
            currentSessionId,
            currentCandidateId,
            eventType,
            module,
            JSON.stringify(metadata));
    }

    return {
        init,
        trackEvent
    };

})();

export default ActivityTracker;