export function validateUsername(name: string): { isValid: boolean; error?: string } {
  if (!name) {
    return { isValid: false, error: 'Le pseudo ne peut pas être vide.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Le pseudo doit faire au moins 2 caractères.' };
  }
  if (trimmed.length > 15) {
    return { isValid: false, error: 'Le pseudo ne peut pas dépasser 15 caractères.' };
  }
  // Simple check for alphanumeric and space/dash/underscore
  const regex = /^[a-zA-Z0-9_\-\s]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, error: 'Le pseudo contient des caractères invalides.' };
  }
  return { isValid: true };
}

export class RateLimiter {
  private lastRequestTimes: Map<string, number> = new Map();

  /**
   * Checks if the event from a given client should be throttled.
   * @param clientId The unique client ID (e.g. socket.id)
   * @param limitMs Minimum duration in ms between consecutive allowed requests
   * @returns true if allowed, false if throttled
   */
  public checkLimit(clientId: string, limitMs: number): boolean {
    const now = Date.now();
    const lastTime = this.lastRequestTimes.get(clientId) || 0;
    if (now - lastTime < limitMs) {
      return false; // Throttled
    }
    this.lastRequestTimes.set(clientId, now);
    return true; // Allowed
  }

  public clear(clientId: string): void {
    this.lastRequestTimes.delete(clientId);
  }
}
