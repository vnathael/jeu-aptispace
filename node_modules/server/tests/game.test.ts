import { describe, it, expect } from 'vitest';
import { checkCircleCollision, calculateChargeTransfer } from 'shared';
import { EntityManager } from '../src/engine/EntityManager.js';
import { PhysicsEngine } from '../src/engine/PhysicsEngine.js';

describe('SURGE.io Unit Tests', () => {
  describe('Collision Detection', () => {
    it('should detect when two circles collide', () => {
      // Circle 1 at (0, 0) radius 10, Circle 2 at (15, 0) radius 10. Distance = 15. Radii sum = 20. Collides!
      const collides = checkCircleCollision(0, 0, 10, 15, 0, 10);
      expect(collides).toBe(true);
    });

    it('should not detect collision when two circles do not overlap', () => {
      // Circle 1 at (0, 0) radius 5, Circle 2 at (20, 20) radius 5. Distance = 28.28. Radii sum = 10. No collision.
      const collides = checkCircleCollision(0, 0, 5, 20, 20, 5);
      expect(collides).toBe(false);
    });
  });

  describe('Charge Transfer on Dash', () => {
    it('should reduce victim charge by 50% and return the lost charge', () => {
      const victimCharge = 80;
      const hasShield = false;
      const lossPercent = 0.5;

      const { victimNewCharge, chargeLost } = calculateChargeTransfer(
        victimCharge,
        hasShield,
        lossPercent,
      );

      expect(victimNewCharge).toBe(40);
      expect(chargeLost).toBe(40);
    });

    it('should not reduce charge or transfer charge if the victim has a shield', () => {
      const victimCharge = 80;
      const hasShield = true;
      const lossPercent = 0.5;

      const { victimNewCharge, chargeLost } = calculateChargeTransfer(
        victimCharge,
        hasShield,
        lossPercent,
      );

      expect(victimNewCharge).toBe(80);
      expect(chargeLost).toBe(0);
    });
  });

  describe('Shield Expiration', () => {
    it('should expire shield when update is run and current time is past shieldUntil', () => {
      const entityManager = new EntityManager();
      const physicsEngine = new PhysicsEngine();

      const player = entityManager.addPlayer('test-player-id', 'Tester');
      player.hasShield = true;
      player.shieldUntil = Date.now() - 1000; // Expired 1 second ago

      physicsEngine.update(entityManager, 0.016); // Run update tick

      expect(player.hasShield).toBe(false);
    });

    it('should keep shield active if shieldUntil is in the future', () => {
      const entityManager = new EntityManager();
      const physicsEngine = new PhysicsEngine();

      const player = entityManager.addPlayer('test-player-id', 'Tester');
      player.hasShield = true;
      player.shieldUntil = Date.now() + 5000; // Active for 5 more seconds

      physicsEngine.update(entityManager, 0.016);

      expect(player.hasShield).toBe(true);
    });
  });

  describe('Score Calculation & Energy Cell Collection', () => {
    it('should increase player score and charge when colliding with energy cell', () => {
      const entityManager = new EntityManager();
      const physicsEngine = new PhysicsEngine();

      const player = entityManager.addPlayer('player-1', 'Alice');
      player.x = 100;
      player.y = 100;
      player.score = 0;
      player.charge = 0;

      // Add energy cell exactly on player position
      entityManager.energyCells = [
        {
          id: 'cell-1',
          x: 100,
          y: 100,
        },
      ];

      // Run physics frame update
      physicsEngine.update(entityManager, 0.016);

      // Score should increase, charge should increase, cell should be collected
      expect(player.score).toBeGreaterThan(0);
      expect(player.charge).toBeGreaterThan(0);
      expect(entityManager.energyCells.length).toBe(0);
    });
  });
});
