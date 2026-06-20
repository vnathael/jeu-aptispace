export class Input {
  public element: HTMLInputElement;

  constructor(placeholder: string, maxLength: number = 15, className: string = '') {
    this.element = document.createElement('input');
    this.element.type = 'text';
    this.element.placeholder = placeholder;
    this.element.maxLength = maxLength;
    this.element.className = `game-input ${className}`.trim();
  }

  public getValue(): string {
    return this.element.value.trim();
  }

  public setValue(val: string): void {
    this.element.value = val;
  }
}
