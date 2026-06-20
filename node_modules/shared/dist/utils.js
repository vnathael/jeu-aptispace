export function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
export function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
    return getDistance(x1, y1, x2, y2) < r1 + r2;
}
/**
 * Calculates the amount of charge lost by the victim during a dash collision.
 * Shielded victims do not lose charge.
 * @returns { victimNewCharge: number, chargeLost: number }
 */
export function calculateChargeTransfer(victimCharge, hasShield, lossPercent) {
    if (hasShield) {
        return { victimNewCharge: victimCharge, chargeLost: 0 };
    }
    const chargeLost = Math.floor(victimCharge * lossPercent);
    const victimNewCharge = Math.max(0, victimCharge - chargeLost);
    return { victimNewCharge, chargeLost };
}
/**
 * Constrains a coordinate to within the world boundaries, taking the entity's radius into account.
 */
export function clampCoordinate(coord, min, max, radius) {
    return Math.max(min + radius, Math.min(max - radius, coord));
}
//# sourceMappingURL=utils.js.map