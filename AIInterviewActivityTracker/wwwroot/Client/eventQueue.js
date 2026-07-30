/**
 * Maintains an in-memory queue for batching activity events.
 */
export class EventQueue {
    constructor(apiClient, beaconTracker, batchSize = 10) {
        if (!apiClient || !beaconTracker) {
            throw new Error("ApiClient and BeaconTracker instances are required.");
        }

        this.apiClient = apiClient;
        this.beaconTracker = beaconTracker;
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
        metadataJson = "{}") {

        if (!sessionId?.trim() || !eventType?.trim()) {
            return;
        }

        const newEvent = {
            sessionId: sessionId.trim(),
            candidateId: candidateId?.trim() ?? "",
            eventType: eventType.trim(),
            module: module?.trim() ?? "",
            metadataJson: metadataJson?.trim() ?? "{}"
        };

        this.queue.push(newEvent);

        console.log(`[EventQueue] Added ${eventType}. Queue Size: ${this.queue.length}`);

        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    /**
     * Uploads queued events using Fetch API.
     */
    async flush() {
        if (this.queue.length === 0) {
            return;
        }

        const eventsToSend = [...this.queue];
        this.queue = [];

        const success = await this.apiClient.sendBatchAsync(eventsToSend);

        if (!success) {
            console.warn("[EventQueue] Upload failed. Restoring queue.");
            this.queue = [...eventsToSend, ...this.queue];
        }
    }

    /**
     * Uploads remaining events using Beacon API.
     */
    flushWithBeacon() {
        if (this.queue.length === 0) {
            return;
        }

        const eventsToSend = [...this.queue];
        this.queue = [];

        const queued = this.beaconTracker.send(eventsToSend);

        if (!queued) {
            console.warn("[EventQueue] Failed to queue Beacon request.");
            this.queue = [...eventsToSend, ...this.queue];
        }
    }
}