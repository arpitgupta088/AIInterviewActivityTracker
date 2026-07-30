/**
 * beaconTracker.js
 * Encapsulates Browser Beacon API operations.
 */
export class BeaconTracker {

    constructor(baseUrl) {
        if (!baseUrl || !baseUrl.trim()) {
            throw new Error("Base URL is required to initialize BeaconTracker.");
        }

        this.baseUrl = baseUrl.trim();
    }

    /**
     * Sends data using Browser Beacon API.
     * @param {Array} payload
     * @returns {boolean}
     */
    send(payload) {

        if (!Array.isArray(payload) || payload.length === 0) {
            return true;
        }

        if (!navigator.sendBeacon) {
            console.warn("[BeaconTracker] Browser does not support Beacon API.");
            return false;
        }

        try {

            const blob = new Blob(
                [JSON.stringify(payload)],
                {
                    type: "application/json"
                });

            return navigator.sendBeacon(
                `${this.baseUrl}/api/v1/activities/batch`,
                blob);

        }
        catch (error) {

            console.error("[BeaconTracker] Failed to send beacon.", error);

            return false;
        }
    }
}