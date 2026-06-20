export class InputController {
  private currentAngle: number = 0;
  private onAngleChange: (angle: number) => void;
  private onDashTriggered: () => void;
  private isEnabled: boolean = false;

  constructor(onAngleChange: (angle: number) => void, onDashTriggered: () => void) {
    this.onAngleChange = onAngleChange;
    this.onDashTriggered = onDashTriggered;
  }

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;

    // Listen to mouse movement
    window.addEventListener('mousemove', this.handleMouseMove);
    // Listen to touch movement
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });

    // Dash trigger via keyboard (Space)
    window.addEventListener('keydown', this.handleKeyDown);
    // Dash trigger via pointer tap
    window.addEventListener('pointerdown', this.handlePointerDown);
  }

  public disable(): void {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('pointerdown', this.handlePointerDown);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.calculateAngle(e.clientX, e.clientY);
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.calculateAngle(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space') {
      e.preventDefault();
      this.onDashTriggered();
    }
  };

  private handlePointerDown = (e: PointerEvent): void => {
    // If clicking on UI, do not trigger dash
    const target = e.target as HTMLElement;
    if (
      target &&
      (target.closest('.glass-panel') || target.tagName === 'BUTTON' || target.tagName === 'INPUT')
    ) {
      return;
    }
    this.onDashTriggered();
  };

  private calculateAngle(clientX: number, clientY: number): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Calculate angle in radians
    const angle = Math.atan2(dy, dx);
    this.currentAngle = angle;
    this.onAngleChange(angle);
  }

  public getAngle(): number {
    return this.currentAngle;
  }
}
