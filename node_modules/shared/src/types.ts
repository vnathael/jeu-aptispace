export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  score: number;
  charge: number;
  isStunned: boolean;
  stunnedUntil: number;
  isDashing: boolean;
  dashEnd: number;
  dashDirX: number;
  dashDirY: number;
  hasShield: boolean;
  shieldUntil: number;
}

export interface EnergyCell {
  id: string;
  x: number;
  y: number;
}

export interface OverchargeZone {
  x: number;
  y: number;
  radius: number;
  active: boolean;
  spawnedAt: number;
}

export interface ShieldPowerUp {
  id: string;
  x: number;
  y: number;
}

export type GamePhase = 'waiting' | 'playing' | 'post-match';

export interface GameStateSnapshot {
  players: Record<string, Player>;
  energyCells: EnergyCell[];
  overchargeZone: OverchargeZone | null;
  shields: ShieldPowerUp[];
  timer: number; // remaining seconds
  phase: GamePhase;
  serverTime: number;
}

// Socket communication event payloads
export interface ServerToClientEvents {
  stateUpdate: (snapshot: GameStateSnapshot) => void;
  matchEnd: (podium: Array<{ id: string; name: string; score: number }>) => void;
  matchStart: () => void;
}

export interface ClientToServerEvents {
  join: (name: string, callback: (success: boolean, error?: string) => void) => void;
  move: (angle: number) => void;
  dash: () => void;
}
