export declare function validateUsername(name: string): {
    isValid: boolean;
    error?: string;
};
export declare class RateLimiter {
    private lastRequestTimes;
    /**
     * Checks if the event from a given client should be throttled.
     * @param clientId The unique client ID (e.g. socket.id)
     * @param limitMs Minimum duration in ms between consecutive allowed requests
     * @returns true if allowed, false if throttled
     */
    checkLimit(clientId: string, limitMs: number): boolean;
    clear(clientId: string): void;
}
