import { GameState } from '../state/GameState.js';
import { GAME_CONSTANTS } from 'shared';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;

  // Local particles for juicy visuals
  private particles: Particle[] = [];
  private lastStates: Record<string, { charge: number; isStunned: boolean; cellCount: number }> =
    {};
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, gameState: GameState) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Impossible d'obtenir le contexte 2D du Canvas.");
    this.ctx = context;
    this.gameState = gameState;

    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
  }

  private resizeCanvas = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  public start(): void {
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (time: number = performance.now()): void => {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Interpolate entity positions
    this.gameState.interpolate(dt);

    // Detect events to trigger particles
    this.detectGameEvents();

    // Update and draw
    this.updateParticles(dt);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnParticles(
    x: number,
    y: number,
    color: string,
    count: number,
    speed: number = 150,
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (0.3 + Math.random() * 0.7) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        radius: Math.random() * 4 + 2,
        color,
        alpha: 1.0,
        decay: 1.0 + Math.random() * 1.5,
      });
    }
  }

  /**
   * Scan client state differences to trigger particle bursts locally.
   */
  private detectGameEvents(): void {
    // Check player changes
    for (const id in this.gameState.players) {
      const player = this.gameState.players[id];
      const last = this.lastStates[id];
      const visual = this.gameState.visualPositions[id];

      if (last && visual) {
        // Collect energy (charge increased or score increased, and cells count dropped)
        if (player.charge > last.charge && !player.isStunned) {
          this.spawnParticles(visual.x, visual.y, '#06b6d4', 8, 80);
        }

        // Stunned!
        if (player.isStunned && !last.isStunned) {
          this.spawnParticles(visual.x, visual.y, '#ef4444', 25, 200);
        }

        // Dash trail
        if (player.isDashing) {
          // Spawn trail particle behind player
          const backX = visual.x - Math.cos(player.angle) * GAME_CONSTANTS.PLAYER_RADIUS;
          const backY = visual.y - Math.sin(player.angle) * GAME_CONSTANTS.PLAYER_RADIUS;
          this.particles.push({
            x: backX,
            y: backY,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            radius: Math.random() * 6 + 3,
            color: player.id === this.gameState.myPlayerId ? '#06b6d4' : '#a855f7',
            alpha: 0.8,
            decay: 2.0,
          });
        }
      }

      this.lastStates[id] = {
        charge: player.charge,
        isStunned: player.isStunned,
        cellCount: this.gameState.energyCells.length,
      };
    }
  }

  private draw(): void {
    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear Screen
    ctx.fillStyle = '#0b0b0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get my player visual position for camera centering
    const myPlayer = this.gameState.getMyPlayer();
    let camX = GAME_CONSTANTS.WORLD_WIDTH / 2;
    let camY = GAME_CONSTANTS.WORLD_HEIGHT / 2;

    if (myPlayer) {
      const visual = this.gameState.visualPositions[myPlayer.id];
      if (visual) {
        camX = visual.x;
        camY = visual.y;
      }
    }

    ctx.save();
    // Translate camera to center on my player
    ctx.translate(canvas.width / 2 - camX, canvas.height / 2 - camY);

    // 1. Draw Grid
    this.drawGrid();

    // 2. Draw World Boundaries
    this.drawBoundaries();

    // 3. Draw Overcharge Zone (Red hazard zone)
    this.drawOverchargeZone();

    // 4. Draw Energy Cells
    this.drawEnergyCells();

    // 5. Draw Shield Powerups
    this.drawShields();

    // 6. Draw Particles
    this.drawParticles();

    // 7. Draw Players
    this.drawPlayers();

    ctx.restore();
  }

  private drawGrid(): void {
    const ctx = this.ctx;
    const step = 80;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= GAME_CONSTANTS.WORLD_WIDTH; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONSTANTS.WORLD_HEIGHT);
    }
    for (let y = 0; y <= GAME_CONSTANTS.WORLD_HEIGHT; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONSTANTS.WORLD_WIDTH, y);
    }
    ctx.stroke();
  }

  private drawBoundaries(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
    ctx.strokeRect(0, 0, GAME_CONSTANTS.WORLD_WIDTH, GAME_CONSTANTS.WORLD_HEIGHT);
    ctx.shadowBlur = 0; // reset
  }

  private drawOverchargeZone(): void {
    const zone = this.gameState.overchargeZone;
    if (!zone || !zone.active) return;

    const ctx = this.ctx;
    const pulse = 0.85 + Math.sin(Date.now() / 150) * 0.05;

    // Draw red danger zone
    ctx.save();
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius * pulse, 0, Math.PI * 2);

    // Fill with gradient
    const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
    gradient.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
    gradient.addColorStop(0.8, 'rgba(244, 63, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(244, 63, 94, 0.5)';
    ctx.stroke();
    ctx.restore();
  }

  private drawEnergyCells(): void {
    const ctx = this.ctx;
    const time = Date.now();

    ctx.save();
    for (const cell of this.gameState.energyCells) {
      const pulse = 1 + Math.sin(time / 200 + cell.x) * 0.15;
      const radius = GAME_CONSTANTS.ENERGY_CELL_RADIUS * pulse;

      // Glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#10b981';

      // Inner gradient
      const grad = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#10b981');
      grad.addColorStop(1, '#047857');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawShields(): void {
    const ctx = this.ctx;
    const time = Date.now();

    ctx.save();
    for (const shield of this.gameState.shields) {
      const pulse = 1 + Math.cos(time / 150 + shield.x) * 0.1;
      const radius = GAME_CONSTANTS.SHIELD_RADIUS * pulse;

      // Glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#f59e0b';

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';

      // Draw shield shape or star
      ctx.beginPath();
      ctx.arc(shield.x, shield.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draw an inner shield symbol
      ctx.beginPath();
      ctx.moveTo(shield.x, shield.y - radius * 0.5);
      ctx.lineTo(shield.x + radius * 0.4, shield.y - radius * 0.3);
      ctx.lineTo(shield.x + radius * 0.3, shield.y + radius * 0.2);
      ctx.lineTo(shield.x, shield.y + radius * 0.55);
      ctx.lineTo(shield.x - radius * 0.3, shield.y + radius * 0.2);
      ctx.lineTo(shield.x - radius * 0.4, shield.y - radius * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }
    ctx.restore();
  }

  private drawParticles(): void {
    const ctx = this.ctx;
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlayers(): void {
    const ctx = this.ctx;
    const myId = this.gameState.myPlayerId;

    for (const id in this.gameState.players) {
      const player = this.gameState.players[id];
      const visual = this.gameState.visualPositions[id];
      if (!visual) continue;

      const isMe = id === myId;
      ctx.save();

      // Reactor Body Color
      let bodyColor = isMe ? '#06b6d4' : '#a855f7'; // Cyan for Me, Purple for others
      let glowColor = isMe ? 'rgba(6, 182, 212, 0.4)' : 'rgba(168, 85, 247, 0.4)';

      if (player.isStunned) {
        bodyColor = '#4b5563'; // Gray out if stunned
        glowColor = 'rgba(75, 85, 99, 0.2)';
      }

      // Draw reactor jet trail (little triangle opposite to angle)
      if (!player.isStunned) {
        const jetAngle = player.angle + Math.PI; // opposite direction
        const jetLen = GAME_CONSTANTS.PLAYER_RADIUS * (1.1 + Math.sin(Date.now() / 50) * 0.15);

        ctx.beginPath();
        ctx.moveTo(visual.x + Math.cos(jetAngle) * jetLen, visual.y + Math.sin(jetAngle) * jetLen);
        ctx.lineTo(
          visual.x + Math.cos(jetAngle + 0.35) * (GAME_CONSTANTS.PLAYER_RADIUS * 0.8),
          visual.y + Math.sin(jetAngle + 0.35) * (GAME_CONSTANTS.PLAYER_RADIUS * 0.8),
        );
        ctx.lineTo(
          visual.x + Math.cos(jetAngle - 0.35) * (GAME_CONSTANTS.PLAYER_RADIUS * 0.8),
          visual.y + Math.sin(jetAngle - 0.35) * (GAME_CONSTANTS.PLAYER_RADIUS * 0.8),
        );
        ctx.closePath();
        ctx.fillStyle = player.isDashing ? '#ef4444' : '#f59e0b'; // Red flare if dashing, orange if moving
        ctx.shadowBlur = 10;
        ctx.shadowColor = player.isDashing ? '#ef4444' : '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw Main Reactor Orb
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;

      // Glow effect of dash
      if (player.isDashing) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f43f5e';
      }

      const gradient = ctx.createRadialGradient(
        visual.x,
        visual.y,
        0,
        visual.x,
        visual.y,
        GAME_CONSTANTS.PLAYER_RADIUS,
      );
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.3, bodyColor);
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(visual.x, visual.y, GAME_CONSTANTS.PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Draw Shield Aura if active
      if (player.hasShield) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(visual.x, visual.y, GAME_CONSTANTS.PLAYER_RADIUS + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Stun indicators (sparks around reactor)
      if (player.isStunned) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        const offset = Date.now() / 100;
        for (let i = 0; i < 4; i++) {
          const a = offset + (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(
            visual.x + Math.cos(a) * (GAME_CONSTANTS.PLAYER_RADIUS + 4),
            visual.y + Math.sin(a) * (GAME_CONSTANTS.PLAYER_RADIUS + 4),
          );
          ctx.lineTo(
            visual.x + Math.cos(a) * (GAME_CONSTANTS.PLAYER_RADIUS + 10),
            visual.y + Math.sin(a) * (GAME_CONSTANTS.PLAYER_RADIUS + 10),
          );
          ctx.stroke();
        }
      }

      // Draw Charge Ring (Outer visual feedback around the player reactor)
      if (player.charge > 0 && !player.isStunned) {
        const ringRadius = GAME_CONSTANTS.PLAYER_RADIUS + 4;
        const chargePercent = player.charge / GAME_CONSTANTS.MAX_CHARGE;
        ctx.strokeStyle = player.charge >= GAME_CONSTANTS.MAX_CHARGE ? '#10b981' : '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw partial circle representing charge
        ctx.arc(
          visual.x,
          visual.y,
          ringRadius,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * chargePercent,
        );
        ctx.stroke();
      }

      // Draw direction pointer arrow for Me (shows where mouse is pointing)
      if (isMe && !player.isStunned) {
        const arrowDist = GAME_CONSTANTS.PLAYER_RADIUS + 14;
        const arrowX = visual.x + Math.cos(player.angle) * arrowDist;
        const arrowY = visual.y + Math.sin(player.angle) * arrowDist;
        ctx.fillStyle = player.charge >= GAME_CONSTANTS.MAX_CHARGE ? '#10b981' : '#06b6d4';
        ctx.beginPath();
        // small triangle pointing outward
        ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Player Name & Score text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'center';

      const displayName = player.name + (isMe ? ' (Vous)' : '');
      ctx.fillText(displayName, visual.x, visual.y - GAME_CONSTANTS.PLAYER_RADIUS - 16);

      ctx.restore();
    }
  }
}
