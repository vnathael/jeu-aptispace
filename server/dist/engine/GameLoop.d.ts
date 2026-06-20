import { GameStateSnapshot } from 'shared';
import { EntityManager } from './EntityManager.js';
import { PhysicsEngine } from './PhysicsEngine.js';
export declare class GameLoop {
    private intervalId;
    private lastTickTime;
    private entityManager;
    private physicsEngine;
    private onTick;
    constructor(entityManager: EntityManager, physicsEngine: PhysicsEngine, onTick: (snapshot: GameStateSnapshot) => void);
    start(): void;
    stop(): void;
    private tick;
    /**
     * Return a shallow copy of cells to ensure clean serialization.
     */
    private energyCellsSanitized;
}
