export class Badge {
  public element: HTMLSpanElement;

  constructor(text: string, className: string = '') {
    this.element = document.createElement('span');
    this.element.className = className;
    this.element.innerText = text;
  }

  public setText(text: string): void {
    this.element.innerText = text;
  }

  public setClass(className: string): void {
    this.element.className = className;
  }
}
