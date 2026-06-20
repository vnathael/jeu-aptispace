import { Player } from 'shared';
import { PlayerRow } from '../molecules/PlayerRow.js';

export class Leaderboard {
  public element: HTMLDivElement;
  private listElement: HTMLUListElement;

  constructor(containerId: string) {
    const parent = document.getElementById(containerId) as HTMLDivElement;
    if (!parent) throw new Error(`Le conteneur #${containerId} est introuvable.`);
    this.element = parent;

    // Build markup
    this.element.className = 'leaderboard-container glass-panel';

    const title = document.createElement('h3');
    title.className = 'leaderboard-title';
    title.innerText = 'CLASSEMENT';

    this.listElement = document.createElement('ul');
    this.listElement.className = 'leaderboard-list';

    this.element.appendChild(title);
    this.element.appendChild(this.listElement);
  }

  public update(players: Record<string, Player>, myId: string | null): void {
    // Clear list
    this.listElement.innerHTML = '';

    const sortedPlayers = Object.values(players)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (sortedPlayers.length === 0) {
      this.element.classList.add('hidden');
      return;
    }

    this.element.classList.remove('hidden');

    sortedPlayers.forEach((player, index) => {
      const rank = index + 1;
      const isSelf = player.id === myId;
      const row = new PlayerRow(rank, player.name, player.score, isSelf);
      this.listElement.appendChild(row.element);
    });
  }

  public show(): void {
    this.element.classList.remove('hidden');
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
