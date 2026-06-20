import { Player, EnergyCell, OverchargeZone, ShieldPowerUp, GamePhase } from 'shared';
import { GAME_CONSTANTS } from 'shared';

export class EntityManager {
  public players: Record<string, Player> = {};
  public energyCells: EnergyCell[] = [];
  public overchargeZone: OverchargeZone | null = null;
  public shields: ShieldPowerUp[] = [];

  public timer: number = GAME_CONSTANTS.MATCH_DURATION;
  public phase: GamePhase = 'playing';
  public phaseEndTime: number = Date.now() + GAME_CONSTANTS.MATCH_DURATION * 1000;

  private nextZoneSpawnTime: number = Date.now() + GAME_CONSTANTS.OVERCHARGE_SPAWN_INTERVAL;
  private nextShieldSpawnTime: number = Date.now() + GAME_CONSTANTS.SHIELD_SPAWN_INTERVAL;

  constructor() {
    this.resetMatch();
  }

  public resetMatch(): void {
    this.energyCells = [];
    this.shields = [];
    this.overchargeZone = null;
    this.phase = 'playing';
    this.timer = GAME_CONSTANTS.MATCH_DURATION;
    this.phaseEndTime = Date.now() + GAME_CONSTANTS.MATCH_DURATION * 1000;
    this.nextZoneSpawnTime = Date.now() + GAME_CONSTANTS.OVERCHARGE_SPAWN_INTERVAL;
    this.nextShieldSpawnTime = Date.now() + GAME_CONSTANTS.SHIELD_SPAWN_INTERVAL;

    // Reset player scores/charges/statuses but keep their connections
    for (const id in this.players) {
      const p = this.players[id];
      p.score = 0;
      p.charge = 0;
      p.isStunned = false;
      p.stunnedUntil = 0;
      p.isDashing = false;
      p.dashEnd = 0;
      p.hasShield = false;
      p.shieldUntil = 0;
      this.respawnPlayer(p);
    }

    // Populate initial energy cells
    this.spawnEnergyCells(GAME_CONSTANTS.MAX_ENERGY_CELLS);
  }

  public addPlayer(id: string, name: string): Player {
    const player: Player = {
      id,
      name,
      x: 0,
      y: 0,
      angle: 0,
      score: 0,
      charge: 0,
      isStunned: false,
      stunnedUntil: 0,
      isDashing: false,
      dashEnd: 0,
      dashDirX: 0,
      dashDirY: 0,
      hasShield: false,
      shieldUntil: 0,
    };
    this.respawnPlayer(player);
    this.players[id] = player;
    return player;
  }

  public removePlayer(id: string): void {
    delete this.players[id];
  }

  public respawnPlayer(player: Player): void {
    player.x =
      Math.random() * (GAME_CONSTANTS.WORLD_WIDTH - 2 * GAME_CONSTANTS.PLAYER_RADIUS) +
      GAME_CONSTANTS.PLAYER_RADIUS;
    player.y =
      Math.random() * (GAME_CONSTANTS.WORLD_HEIGHT - 2 * GAME_CONSTANTS.PLAYER_RADIUS) +
      GAME_CONSTANTS.PLAYER_RADIUS;
    player.isDashing = false;
    player.dashEnd = 0;
    // Don't reset score or charge on random respawn (unless it's a match reset)
  }

  public spawnEnergyCells(count: number): void {
    for (let i = 0; i < count; i++) {
      this.energyCells.push({
        id: Math.random().toString(36).substring(2, 9),
        x:
          Math.random() * (GAME_CONSTANTS.WORLD_WIDTH - 2 * GAME_CONSTANTS.ENERGY_CELL_RADIUS) +
          GAME_CONSTANTS.ENERGY_CELL_RADIUS,
        y:
          Math.random() * (GAME_CONSTANTS.WORLD_HEIGHT - 2 * GAME_CONSTANTS.ENERGY_CELL_RADIUS) +
          GAME_CONSTANTS.ENERGY_CELL_RADIUS,
      });
    }
  }

  public spawnEnergyCellAt(x: number, y: number): void {
    // Add minor scatter offset
    const offsetAngle = Math.random() * Math.PI * 2;
    const offsetDist = Math.random() * 80 + 30; // Between 30 and 110 px from point
    const cellX = Math.max(
      GAME_CONSTANTS.ENERGY_CELL_RADIUS,
      Math.min(
        GAME_CONSTANTS.WORLD_WIDTH - GAME_CONSTANTS.ENERGY_CELL_RADIUS,
        x + Math.cos(offsetAngle) * offsetDist,
      ),
    );
    const cellY = Math.max(
      GAME_CONSTANTS.ENERGY_CELL_RADIUS,
      Math.min(
        GAME_CONSTANTS.WORLD_HEIGHT - GAME_CONSTANTS.ENERGY_CELL_RADIUS,
        y + Math.sin(offsetAngle) * offsetDist,
      ),
    );

    this.energyCells.push({
      id: Math.random().toString(36).substring(2, 9),
      x: cellX,
      y: cellY,
    });
  }

  public spawnShield(): void {
    if (this.shields.length >= GAME_CONSTANTS.SHIELD_MAX_ACTIVE) {
      return;
    }
    this.shields.push({
      id: Math.random().toString(36).substring(2, 9),
      x:
        Math.random() * (GAME_CONSTANTS.WORLD_WIDTH - 2 * GAME_CONSTANTS.SHIELD_RADIUS) +
        GAME_CONSTANTS.SHIELD_RADIUS,
      y:
        Math.random() * (GAME_CONSTANTS.WORLD_HEIGHT - 2 * GAME_CONSTANTS.SHIELD_RADIUS) +
        GAME_CONSTANTS.SHIELD_RADIUS,
    });
  }

  public updateTimers(): void {
    const now = Date.now();

    // Game Timer Update
    if (this.phase === 'playing') {
      const remaining = Math.max(0, Math.ceil((this.phaseEndTime - now) / 1000));
      this.timer = remaining;
      if (remaining === 0) {
        this.endRound();
      }
    } else if (this.phase === 'post-match') {
      const remaining = Math.max(0, Math.ceil((this.phaseEndTime - now) / 1000));
      this.timer = remaining;
      if (remaining === 0) {
        this.resetMatch();
      }
    }

    if (this.phase !== 'playing') {
      return;
    }

    // Overcharge Zone Lifecycle
    if (this.overchargeZone && this.overchargeZone.active) {
      if (now - this.overchargeZone.spawnedAt >= GAME_CONSTANTS.OVERCHARGE_DURATION) {
        this.overchargeZone = null;
        this.nextZoneSpawnTime = now + GAME_CONSTANTS.OVERCHARGE_SPAWN_INTERVAL;
      }
    } else {
      if (now >= this.nextZoneSpawnTime) {
        this.overchargeZone = {
          x:
            Math.random() * (GAME_CONSTANTS.WORLD_WIDTH - 2 * GAME_CONSTANTS.OVERCHARGE_RADIUS) +
            GAME_CONSTANTS.OVERCHARGE_RADIUS,
          y:
            Math.random() * (GAME_CONSTANTS.WORLD_HEIGHT - 2 * GAME_CONSTANTS.OVERCHARGE_RADIUS) +
            GAME_CONSTANTS.OVERCHARGE_RADIUS,
          radius: GAME_CONSTANTS.OVERCHARGE_RADIUS,
          active: true,
          spawnedAt: now,
        };
      }
    }

    // Shield spawn check
    if (now >= this.nextShieldSpawnTime) {
      this.spawnShield();
      this.nextShieldSpawnTime = now + GAME_CONSTANTS.SHIELD_SPAWN_INTERVAL;
    }

    // Maintain minimum energy cells
    if (this.energyCells.length < GAME_CONSTANTS.MAX_ENERGY_CELLS) {
      this.spawnEnergyCells(GAME_CONSTANTS.MAX_ENERGY_CELLS - this.energyCells.length);
    }
  }

  private endRound(): void {
    this.phase = 'post-match';
    this.phaseEndTime = Date.now() + GAME_CONSTANTS.POST_MATCH_COOLDOWN * 1000;
  }

  public getPodium(): Array<{ id: string; name: string; score: number }> {
    return Object.values(this.players)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, score: p.score }));
  }
}
