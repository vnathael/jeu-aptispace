export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCircleCollision(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): boolean {
  return getDistance(x1, y1, x2, y2) < r1 + r2;
}

/**
 * Calculates the amount of charge lost by the victim during a dash collision.
 * Shielded victims do not lose charge.
 * @returns { victimNewCharge: number, chargeLost: number }
 */
export function calculateChargeTransfer(
  victimCharge: number,
  hasShield: boolean,
  lossPercent: number,
): { victimNewCharge: number; chargeLost: number } {
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
export function clampCoordinate(coord: number, min: number, max: number, radius: number): number {
  return Math.max(min + radius, Math.min(max - radius, coord));
}
