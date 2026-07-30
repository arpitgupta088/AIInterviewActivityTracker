/**
 * Handles all HTTP communication with the Backend API.
 */
export class ApiClient {
    constructor(baseUrl) {
        if (!baseUrl || !baseUrl.trim()) {
            throw new Error("Base URL is required to initialize ApiClient.");
        }

        this.baseUrl = baseUrl.trim();
    }

    /**
     * Sends batched activity events using Fetch API.
     * @param {Array} events
     * @returns {Promise<boolean>}
     */
    async sendBatchAsync(events) {
        if (!Array.isArray(events) || events.length === 0) {
            return true;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/activities/batch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(events)
            });

            return response.ok;
        }
        catch (error) {
            console.error("[ApiClient] Failed to send batch events.", error);
            return false;
        }
    }

    /**
     * Sends remaining events using Browser Beacon API.
     * @param {Array} events
     * @returns {boolean}
     */
    sendBeaconBatch(events) {
        if (!Array.isArray(events) || events.length === 0) {
            return true;
        }

        try {
            const blob = new Blob(
                [JSON.stringify(events)],
                {
                    type: "application/json"
                });

            return navigator.sendBeacon(
                `${this.baseUrl}/api/v1/activities/batch`,
                blob);
        }
        catch (error) {
            console.error("[ApiClient] Beacon API failed.", error);
            return false;
        }
    }
}