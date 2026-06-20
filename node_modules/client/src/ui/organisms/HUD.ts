import { ScoreTag } from '../atoms/ScoreTag.js';
import { ChargeBar } from '../atoms/ChargeBar.js';

export class HUD {
  public element: HTMLDivElement;
  private scoreTag: ScoreTag;
  private timerBadge: HTMLDivElement;
  private chargeBar: ChargeBar;

  constructor(containerId: string) {
    const parent = document.getElementById(containerId) as HTMLDivElement;
    if (!parent) throw new Error(`Le conteneur #${containerId} est introuvable.`);
    this.element = parent;

    // Apply main class
    this.element.className = 'hud-container glass-panel';

    // Top row container
    const topRow = document.createElement('div');
    topRow.className = 'hud-top-row';

    this.scoreTag = new ScoreTag('SCORE', 0);

    this.timerBadge = document.createElement('div');
    this.timerBadge.className = 'hud-timer-badge';
    this.timerBadge.innerText = '00:00';

    topRow.appendChild(this.scoreTag.element);
    topRow.appendChild(this.timerBadge);

    // Charge Bar (Bottom)
    this.chargeBar = new ChargeBar();

    // Assemble HUD
    this.element.appendChild(topRow);
    this.element.appendChild(this.chargeBar.element);
  }

  public update(score: number, charge: number, remainingSeconds: number): void {
    this.scoreTag.setScore(score);
    this.chargeBar.setCharge(charge);
    this.setTimer(remainingSeconds);
  }

  private setTimer(seconds: number): void {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    this.timerBadge.innerText = formatted;

    // Add alert class if timer is low (under 15s)
    if (seconds <= 15 && seconds > 0) {
      this.timerBadge.classList.add('danger');
    } else {
      this.timerBadge.classList.remove('danger');
    }
  }

  public show(): void {
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
