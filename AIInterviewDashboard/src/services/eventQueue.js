export class EventQueue {
    constructor(apiClient, batchSize = 10) {
        if (!apiClient) {
            throw new Error("ApiClient instance is required.");
        }

        this.apiClient = apiClient;
        this.batchSize = batchSize;
        this.queue = [];
    }

    /**
     * Adds an event to the queue.
     */
    addEvent(
        sessionId,
        candidateId,
        eventType,
        module = "",
        metadataJson = "{}"
    ) {
        if (!sessionId?.trim() || !eventType?.trim()) {
            return;
        }

        const newEvent = {
            sessionId: sessionId.trim(),
            candidateId: candidateId?.trim() ?? "",
            eventType: eventType.trim(),
            module: module?.trim() ?? "",
            metadataJson: metadataJson?.trim() ?? "{}",
        };

        this.queue.push(newEvent);

        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Sends queued events through the Browser Beacon API.
     */
    flush() {
        if (this.queue.length === 0) {
            console.log("[EventQueue] Queue is empty.");
            return;
        }

        const eventsToSend = [...this.queue];
        this.queue = [];

        const queued =
            this.apiClient.sendBeaconBatch(eventsToSend);

        if (!queued) {
            console.warn(
                "[EventQueue] Beacon request failed. Restoring queue."
            );

            this.queue = [
                ...eventsToSend,
                ...this.queue,
            ];
        }
    }
    /**
     * Sends remaining events through the Browser Beacon API.
     */
    flushWithBeacon() {
        this.flush();
    }
}