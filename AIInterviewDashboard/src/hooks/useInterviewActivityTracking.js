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

            if (!shouldLogEvent()) {
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

            onTabReturn?.();
            await logEvent(
                "TAB_RETURNED",
                {
                    visibilityState: "visible",
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

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
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