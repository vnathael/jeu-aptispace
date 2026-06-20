import { GAME_CONSTANTS, GameStateSnapshot } from 'shared';
import { EntityManager } from './EntityManager.js';
import { PhysicsEngine } from './PhysicsEngine.js';

export class GameLoop {
  private intervalId: NodeJS.Timeout | null = null;
  private lastTickTime: number = 0;
  private entityManager: EntityManager;
  private physicsEngine: PhysicsEngine;
  private onTick: (snapshot: GameStateSnapshot) => void;

  constructor(
    entityManager: EntityManager,
    physicsEngine: PhysicsEngine,
    onTick: (snapshot: GameStateSnapshot) => void,
  ) {
    this.entityManager = entityManager;
    this.physicsEngine = physicsEngine;
    this.onTick = onTick;
  }

  public start(): void {
    if (this.intervalId) {
      return;
    }
    this.lastTickTime = Date.now();
    this.intervalId = setInterval(() => this.tick(), GAME_CONSTANTS.TICK_INTERVAL);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
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
  private energyCellsSanitized() {
    return this.entityManager.energyCells.map((cell) => ({
      id: cell.id,
      x: cell.x,
      y: cell.y,
    }));
  }
}
