/**
 * Tracks browser and interview lifecycle activity for an interview session.
 *
 * Input:
 * - sessionId: Unique identifier of the interview session.
 * - candidateId: Unique identifier of the candidate.
 * - logEvent: Callback used to persist activity events.
 * - onTabSwitch: Optional callback invoked when the tab becomes hidden.
 * - onTabReturn: Optional callback invoked when the tab becomes visible again.
 *
 * Output:
 * - Registers and cleans up browser activity event listeners.
 * - Logs visibility, fullscreen, network, and page lifecycle events.
 */

import { useEffect, useRef } from "react";

function useInterviewActivityTracking({
    sessionId,
    candidateId,
    logEvent,
    onTabSwitch,
    onTabReturn,
}) {
    const lastVisibilityState = useRef(document.visibilityState);

    const lastEventTime = useRef(0);

    const networkOfflineStartedAt = useRef(null);

    useEffect(() => {
        if (!sessionId || !candidateId || !logEvent) {
            return;
        }

        const shouldLogEvent = () => {
            const now = Date.now();

            if (now - lastEventTime.current < 500) {
                return false;
            }

            lastEventTime.current = now;

            return true;
        };

        const handleVisibilityChange = async () => {
            const currentState = document.visibilityState;

            if (
                currentState ===
                lastVisibilityState.current
            ) {
                return;
            }

            lastVisibilityState.current = currentState;


            if (currentState === "hidden") {
                onTabSwitch?.();

                await logEvent(
                    "TAB_SWITCHED",
                    {
                        visibilityState: "hidden",
                    }
                );

                return;

            }

            if (currentState === "visible") {
                onTabReturn?.();
                await logEvent(
                    "TAB_RETURNED",
                    {
                        visibilityState: "visible",
                    }
                );
            };
        };

        const handleWindowBlur = async () => {
            await logEvent(
                "WINDOW_BLURRED",
                {
                    reason: "WINDOW_LOST_FOCUS",
                    timestamp: new Date().toISOString(),
                }
            );
        };

        const handleWindowFocus = async () => {
            await logEvent(
                "WINDOW_FOCUSED",
                {
                    reason: "WINDOW_GAINED_FOCUS",
                    timestamp: new Date().toISOString(),
                }
            );
        };

        const handleFullscreenChange = async () => {
            if (!shouldLogEvent()) {
                return;
            }

            if (document.fullscreenElement) {
                await logEvent(
                    "FULLSCREEN_ENTERED"
                );
            } else {
                await logEvent(
                    "FULLSCREEN_EXITED"
                );
            }
        };

        const handlePageHide = (event) => {
            if (event.persisted) {
                return;
            }

            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

            const payload = new URLSearchParams();

            payload.append("SessionId", sessionId);
            payload.append("CandidateId", candidateId);
            payload.append("EventType", "PAGE_LEFT");
            payload.append("Module", "INTERVIEW");
            payload.append(
                "MetadataJson",
                JSON.stringify({
                    reason: "PAGE_HIDE",
                    timestamp: new Date().toISOString(),
                })
            );

            const queued = navigator.sendBeacon(
                `${apiBaseUrl}/activities/beacon`,
                payload
            );

            console.log("PAGE_LEFT beacon queued:", queued);
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        window.addEventListener("blur", handleWindowBlur);

        const handleOffline = async () => {
            if (networkOfflineStartedAt.current) {
                return;
            }

            const timestamp = new Date().toISOString();

            networkOfflineStartedAt.current = timestamp;

            await logEvent("NETWORK_OFFLINE", {
                online: false,
                timestamp,
            });
        };

        const handleOnline = async () => {
            const timestamp = new Date().toISOString();

            let disconnectedDurationMs = null;
            let offlineStartedAt = null;

            if (networkOfflineStartedAt.current) {
                offlineStartedAt =
                    networkOfflineStartedAt.current;

                const offlineTime =
                    new Date(offlineStartedAt).getTime();

                const onlineTime =
                    new Date(timestamp).getTime();

                disconnectedDurationMs =
                    onlineTime - offlineTime;
            }

            await logEvent("NETWORK_ONLINE", {
                online: true,
                timestamp,
                offlineStartedAt,
                disconnectedDurationMs,
            });

            networkOfflineStartedAt.current = null;
        };

        window.addEventListener(
            "offline",
            handleOffline
        );

        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener("focus", handleWindowFocus);

        window.addEventListener("pagehide", handlePageHide);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );

            window.removeEventListener("blur", handleWindowBlur);

            window.removeEventListener("focus", handleWindowFocus);

            window.removeEventListener(
                "offline",
                handleOffline
            );

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "pagehide",
                handlePageHide
            );
        };
    }, [
        sessionId,
        candidateId,
        logEvent,
        onTabSwitch,
        onTabReturn,
    ]);
}

export default useInterviewActivityTracking;