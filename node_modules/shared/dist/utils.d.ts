export declare function getDistance(x1: number, y1: number, x2: number, y2: number): number;
export declare function checkCircleCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean;
/**
 * Calculates the amount of charge lost by the victim during a dash collision.
 * Shielded victims do not lose charge.
 * @returns { victimNewCharge: number, chargeLost: number }
 */
export declare function calculateChargeTransfer(victimCharge: number, hasShield: boolean, lossPercent: number): {
    victimNewCharge: number;
    chargeLost: number;
};
/**
 * Constrains a coordinate to within the world boundaries, taking the entity's radius into account.
 */
export declare function clampCoordinate(coord: number, min: number, max: number, radius: number): number;
