import { EntityManager } from './EntityManager.js';
import { Player } from 'shared';
export declare class PhysicsEngine {
    update(entityManager: EntityManager, dt: number): void;
    /**
     * Attempts to trigger a Surge Dash for the given player.
     */
    triggerDash(player: Player): boolean;
}
