import { Badge } from '../atoms/Badge.js';

export class ConnectionStatus {
  public element: HTMLDivElement;
  private dotElement: HTMLDivElement;
  private textBadge: Badge;

  constructor(initialConnected: boolean = false) {
    this.element = document.createElement('div');
    this.element.className = 'status-badge';

    this.dotElement = document.createElement('div');
    this.dotElement.className = 'status-dot';

    this.textBadge = new Badge('', 'status-text');

    this.element.appendChild(this.dotElement);
    this.element.appendChild(this.textBadge.element);

    this.setStatus(initialConnected);
  }

  public setStatus(connected: boolean): void {
    if (connected) {
      this.dotElement.className = 'status-dot connected';
      this.textBadge.setText('SERVEUR EN LIGNE');
      this.textBadge.setClass('status-text');
    } else {
      this.dotElement.className = 'status-dot disconnected';
      this.textBadge.setText('SERVEUR HORS LIGNE');
      this.textBadge.setClass('status-text');
    }
  }
}
