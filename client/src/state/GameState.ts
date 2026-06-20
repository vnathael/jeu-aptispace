import {
  GameStateSnapshot,
  Player,
  EnergyCell,
  OverchargeZone,
  ShieldPowerUp,
  GamePhase,
} from 'shared';

export class GameState {
  public myPlayerId: string | null = null;
  public players: Record<string, Player> = {};
  public energyCells: EnergyCell[] = [];
  public overchargeZone: OverchargeZone | null = null;
  public shields: ShieldPowerUp[] = [];
  public timer: number = 0;
  public phase: GamePhase = 'waiting';
  public serverTime: number = 0;

  // Track player visual positions for interpolation
  public visualPositions: Record<string, { x: number; y: number }> = {};

  public update(snapshot: GameStateSnapshot): void {
    this.players = snapshot.players;
    this.energyCells = snapshot.energyCells;
    this.overchargeZone = snapshot.overchargeZone;
    this.shields = snapshot.shields;
    this.timer = snapshot.timer;
    this.phase = snapshot.phase;
    this.serverTime = snapshot.serverTime;

    // Initialize visual positions for new players
    for (const id in this.players) {
      if (!this.visualPositions[id]) {
        this.visualPositions[id] = {
          x: this.players[id].x,
          y: this.players[id].y,
        };
      }
    }

    // Clean up disconnected players from visual positions
    for (const id in this.visualPositions) {
      if (!this.players[id]) {
        delete this.visualPositions[id];
      }
    }
  }

  /**
   * Smoothly interpolates the visual positions towards actual server positions.
   * @param dt delta time in seconds
   */
  public interpolate(dt: number): void {
    // Speed factor of interpolation (higher = faster, lower = smoother but slight lag)
    // 15 is a good balance for 30Hz server tickrate
    const lerpFactor = Math.min(1, 15 * dt);

    for (const id in this.players) {
      const serverPlayer = this.players[id];
      const visual = this.visualPositions[id];

      if (visual) {
        // If player is dashing, interpolate much faster to keep up with high speed movement
        const currentLerp = serverPlayer.isDashing ? Math.min(1, 25 * dt) : lerpFactor;

        // Handle teleport or major desync (e.g. respawn)
        const distance = Math.hypot(serverPlayer.x - visual.x, serverPlayer.y - visual.y);
        if (distance > 300) {
          visual.x = serverPlayer.x;
          visual.y = serverPlayer.y;
        } else {
          visual.x += (serverPlayer.x - visual.x) * currentLerp;
          visual.y += (serverPlayer.y - visual.y) * currentLerp;
        }
      }
    }
  }

  public getMyPlayer(): Player | null {
    if (!this.myPlayerId) return null;
    return this.players[this.myPlayerId] || null;
  }
}
