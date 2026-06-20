import { GAME_CONSTANTS } from 'shared';
export class GameLoop {
    intervalId = null;
    lastTickTime = 0;
    entityManager;
    physicsEngine;
    onTick;
    constructor(entityManager, physicsEngine, onTick) {
        this.entityManager = entityManager;
        this.physicsEngine = physicsEngine;
        this.onTick = onTick;
    }
    start() {
        if (this.intervalId) {
            return;
        }
        this.lastTickTime = Date.now();
        this.intervalId = setInterval(() => this.tick(), GAME_CONSTANTS.TICK_INTERVAL);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    tick() {
        const now = Date.now();
        // Delta time in seconds
        const dt = (now - this.lastTickTime) / 1000;
        this.lastTickTime = now;
        // Prevent huge steps if the process hangs
        const maxDt = 0.1;
        const clampedDt = Math.min(dt, maxDt);
        // Update timers (match duration, overcharge zone spawn/despawn, shield spawns)
        this.entityManager.updateTimers();
        // Update physics/movements/collisions
        this.physicsEngine.update(this.entityManager, clampedDt);
        // Broadcast current snapshot to players
        const snapshot = {
            players: this.entityManager.players,
            energyCells: this.energyCellsSanitized(),
            overchargeZone: this.entityManager.overchargeZone,
            shields: this.entityManager.shields,
            timer: this.entityManager.timer,
            phase: this.entityManager.phase,
            serverTime: now,
        };
        this.onTick(snapshot);
    }
    /**
     * Return a shallow copy of cells to ensure clean serialization.
     */
    energyCellsSanitized() {
        return this.entityManager.energyCells.map((cell) => ({
            id: cell.id,
            x: cell.x,
            y: cell.y,
        }));
    }
}
//# sourceMappingURL=GameLoop.js.map