export class EventQueue {
    constructor(apiClient, batchSize = 10) {
        if (!apiClient) {
            throw new Error("ApiClient instance is required.");
        }

        this.apiClient = apiClient;
        this.batchSize = batchSize;
        this.storageKey = "activity_event_queue";

        this.sequenceStorageKey = "activity_event_sequence_number";

        this.queue =
            this.loadQueueFromStorage();

        this.sequenceNumber =
            this.loadSequenceNumber();
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

        this.sequenceNumber += 1;

        this.saveSequenceNumber();

        const newEvent = {
            sessionId: sessionId.trim(),
            candidateId: candidateId?.trim() ?? "",
            eventType: eventType.trim(),
            module: module?.trim() ?? "",
            metadataJson: metadataJson?.trim() ?? "{}",

            sequenceNumber: this.sequenceNumber,
        };

        this.queue.push(newEvent);

        this.saveQueueToStorage();

        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    loadQueueFromStorage() {
        try {
            const storedQueue =
                localStorage.getItem(
                    this.storageKey
                );

            if (!storedQueue) {
                return [];
            }

            return JSON.parse(storedQueue);
        } catch (error) {
            console.error(
                "[EventQueue] Failed to load queue:",
                error
            );

            return [];
        }
    }

    saveQueueToStorage() {
        try {
            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.queue)
            );
        } catch (error) {
            console.error(
                "[EventQueue] Failed to save queue:",
                error
            );
        }
    }

    loadSequenceNumber() {
        try {
            const storedSequenceNumber =
                localStorage.getItem(
                    this.sequenceStorageKey
                );

            return Number(storedSequenceNumber) || 0;
        } catch (error) {
            console.error(
                "[EventQueue] Failed to load sequence number:",
                error
            );

            return 0;
        }
    }

    saveSequenceNumber() {
        try {
            localStorage.setItem(
                this.sequenceStorageKey,
                this.sequenceNumber.toString()
            );
        } catch (error) {
            console.error(
                "[EventQueue] Failed to save sequence number:",
                error
            );
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

        const queued =
            this.apiClient.sendBeaconBatch(eventsToSend);

        if (queued) {
            this.queue = [];

            this.saveQueueToStorage();

            return;
        }

        console.warn(
            "[EventQueue] Beacon request failed. Keeping events in queue."
        );

        this.saveQueueToStorage();
    }
    /**
     * Sends remaining events through the Browser Beacon API.
     */
    flushWithBeacon() {
        this.flush();
    }
}