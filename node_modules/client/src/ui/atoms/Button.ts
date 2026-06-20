export class Button {
  public element: HTMLButtonElement;

  constructor(text: string, onClick: () => void, className: string = '') {
    this.element = document.createElement('button');
    this.element.className = `game-btn ${className}`.trim();
    this.element.innerText = text;
    this.element.addEventListener('click', onClick);
  }

  public setEnabled(enabled: boolean): void {
    this.element.disabled = !enabled;
  }
}
