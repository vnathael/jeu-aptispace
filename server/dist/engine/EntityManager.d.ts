import { Player, EnergyCell, OverchargeZone, ShieldPowerUp, GamePhase } from 'shared';
export declare class EntityManager {
    players: Record<string, Player>;
    energyCells: EnergyCell[];
    overchargeZone: OverchargeZone | null;
    shields: ShieldPowerUp[];
    timer: number;
    phase: GamePhase;
    phaseEndTime: number;
    private nextZoneSpawnTime;
    private nextShieldSpawnTime;
    constructor();
    resetMatch(): void;
    addPlayer(id: string, name: string): Player;
    removePlayer(id: string): void;
    respawnPlayer(player: Player): void;
    spawnEnergyCells(count: number): void;
    spawnEnergyCellAt(x: number, y: number): void;
    spawnShield(): void;
    updateTimers(): void;
    private endRound;
    getPodium(): Array<{
        id: string;
        name: string;
        score: number;
    }>;
}
