import { EntityManager } from './EntityManager.js';
import {
  GAME_CONSTANTS,
  checkCircleCollision,
  calculateChargeTransfer,
  clampCoordinate,
  Player,
} from 'shared';

export class PhysicsEngine {
  public update(entityManager: EntityManager, dt: number): void {
    const now = Date.now();

    // 1. Move and update players
    for (const id in entityManager.players) {
      const player = entityManager.players[id];

      // Handle Stun state
      if (player.isStunned) {
        if (now >= player.stunnedUntil) {
          player.isStunned = false;
        }
      }

      // Handle Shield state
      if (player.hasShield) {
        if (now >= player.shieldUntil) {
          player.hasShield = false;
        }
      }

      let speed = GAME_CONSTANTS.PLAYER_SPEED;
      if (player.isStunned) {
        speed *= GAME_CONSTANTS.STUN_SPEED_MULTIPLIER;
      }

      // Handle Dash state
      if (player.isDashing) {
        if (now >= player.dashEnd) {
          player.isDashing = false;
        } else {
          // Dash movement (uses pre-stored dash direction at high speed)
          player.x += player.dashDirX * GAME_CONSTANTS.DASH_SPEED * dt;
          player.y += player.dashDirY * GAME_CONSTANTS.DASH_SPEED * dt;
        }
      } else {
        // Normal movement along the angle
        player.x += Math.cos(player.angle) * speed * dt;
        player.y += Math.sin(player.angle) * speed * dt;
      }

      // Clamp coordinates to keep inside world boundaries
      player.x = clampCoordinate(
        player.x,
        0,
        GAME_CONSTANTS.WORLD_WIDTH,
        GAME_CONSTANTS.PLAYER_RADIUS,
      );
      player.y = clampCoordinate(
        player.y,
        0,
        GAME_CONSTANTS.WORLD_HEIGHT,
        GAME_CONSTANTS.PLAYER_RADIUS,
      );
    }

    if (entityManager.phase !== 'playing') {
      return;
    }

    // 2. Overcharge Zone drain
    if (entityManager.overchargeZone && entityManager.overchargeZone.active) {
      const zone = entityManager.overchargeZone;
      for (const id in entityManager.players) {
        const player = entityManager.players[id];
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < zone.radius) {
          player.charge = Math.max(0, player.charge - GAME_CONSTANTS.OVERCHARGE_DRAIN_RATE * dt);
        }
      }
    }

    // 3. Energy Cell collection
    for (const id in entityManager.players) {
      const player = entityManager.players[id];
      entityManager.energyCells = entityManager.energyCells.filter((cell) => {
        const collides = checkCircleCollision(
          player.x,
          player.y,
          GAME_CONSTANTS.PLAYER_RADIUS,
          cell.x,
          cell.y,
          GAME_CONSTANTS.ENERGY_CELL_RADIUS,
        );
        if (collides) {
          // Increase score and charge
          player.score += GAME_CONSTANTS.SCORE_PER_CELL;
          player.charge = Math.min(
            GAME_CONSTANTS.MAX_CHARGE,
            player.charge + GAME_CONSTANTS.CHARGE_CELL_VALUE,
          );
          return false; // Remove cell
        }
        return true;
      });
    }

    // 4. Shield Powerup collection
    for (const id in entityManager.players) {
      const player = entityManager.players[id];
      entityManager.shields = entityManager.shields.filter((shield) => {
        const collides = checkCircleCollision(
          player.x,
          player.y,
          GAME_CONSTANTS.PLAYER_RADIUS,
          shield.x,
          shield.y,
          GAME_CONSTANTS.SHIELD_RADIUS,
        );
        if (collides) {
          player.hasShield = true;
          player.shieldUntil = now + GAME_CONSTANTS.SHIELD_DURATION;
          return false; // Remove shield powerup from map
        }
        return true;
      });
    }

    // 5. Dash collision (Player vs Player)
    for (const attackerId in entityManager.players) {
      const attacker = entityManager.players[attackerId];
      if (!attacker.isDashing) {
        continue;
      }

      for (const victimId in entityManager.players) {
        if (attackerId === victimId) {
          continue;
        }

        const victim = entityManager.players[victimId];
        // If victim is already stunned or dashing or has shield, they behave accordingly
        const collides = checkCircleCollision(
          attacker.x,
          attacker.y,
          GAME_CONSTANTS.PLAYER_RADIUS,
          victim.x,
          victim.y,
          GAME_CONSTANTS.PLAYER_RADIUS,
        );

        if (collides) {
          // If victim is shielded, they are immune to stuns/charge drains
          if (victim.hasShield) {
            continue;
          }

          // Apply stun to victim
          victim.isStunned = true;
          victim.stunnedUntil = now + GAME_CONSTANTS.DASH_STUN_DURATION;
          victim.isDashing = false; // Interrupt victim's dash if they were dashing

          // Calculate charge transfer
          const { victimNewCharge, chargeLost } = calculateChargeTransfer(
            victim.charge,
            victim.hasShield,
            GAME_CONSTANTS.DASH_CHARGE_LOSS_PERCENT,
          );

          victim.charge = victimNewCharge;

          // Scatter lost charge as energy cells
          if (chargeLost > 0) {
            const cellsToSpawn = Math.max(
              1,
              Math.floor(chargeLost / GAME_CONSTANTS.CHARGE_CELL_VALUE),
            );
            for (let i = 0; i < cellsToSpawn; i++) {
              entityManager.spawnEnergyCellAt(victim.x, victim.y);
            }
          }
        }
      }
    }
  }

  /**
   * Attempts to trigger a Surge Dash for the given player.
   */
  public triggerDash(player: Player): boolean {
    if (player.charge < GAME_CONSTANTS.MAX_CHARGE) {
      return false;
    }
    if (player.isStunned) {
      return false;
    }
    const now = Date.now();
    player.isDashing = true;
    player.dashEnd = now + GAME_CONSTANTS.DASH_DURATION;
    // Set dash directions based on current direction angle
    player.dashDirX = Math.cos(player.angle);
    player.dashDirY = Math.sin(player.angle);
    player.charge = 0; // Consume all charge
    return true;
  }
}
