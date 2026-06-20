export class ChargeBar {
  public element: HTMLDivElement;
  private fillElement: HTMLDivElement;
  private textElement: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'charge-bar-wrapper';

    this.fillElement = document.createElement('div');
    this.fillElement.className = 'charge-bar-fill';

    this.textElement = document.createElement('div');
    this.textElement.className = 'charge-bar-text';
    this.textElement.innerText = 'CHARGE : 0%';

    this.element.appendChild(this.fillElement);
    this.element.appendChild(this.textElement);
  }

  public setCharge(charge: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(charge)));
    this.fillElement.style.width = `${clamped}%`;

    if (clamped >= 100) {
      this.textElement.innerText = 'SURGE DASH DISPONIBLE [ESPACE]';
      this.fillElement.classList.add('full');
    } else {
      this.textElement.innerText = `CHARGE : ${clamped}%`;
      this.fillElement.classList.remove('full');
    }
  }
}
