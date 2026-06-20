export interface PodiumPlayer {
  name: string;
  score: number;
}

export class RoundEndModal {
  public element: HTMLDivElement;
  private podiumContainer: HTMLDivElement;
  private countdownElement: HTMLDivElement;

  constructor(containerId: string) {
    const parent = document.getElementById(containerId) as HTMLDivElement;
    if (!parent) throw new Error(`Le conteneur #${containerId} est introuvable.`);
    this.element = parent;

    // Apply modal backdrop
    this.element.className = 'modal-backdrop hidden';

    // Content card
    const card = document.createElement('div');
    card.className = 'round-end-card glass-panel';

    const title = document.createElement('h2');
    title.className = 'modal-title';
    title.innerText = 'FIN DE MANCHE !';

    const subtitle = document.createElement('p');
    subtitle.className = 'modal-subtitle';
    subtitle.innerText = 'Podium des meilleurs pilotes de réacteur';

    // Podium Area
    this.podiumContainer = document.createElement('div');
    this.podiumContainer.className = 'podium-container';

    // Countdown before next match
    this.countdownElement = document.createElement('div');
    this.countdownElement.className = 'countdown-text';
    this.countdownElement.innerText = 'Prochaine manche dans 10 secondes...';

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(this.podiumContainer);
    card.appendChild(this.countdownElement);

    this.element.appendChild(card);
  }

  public show(podium: PodiumPlayer[], nextRoundCountdown: number): void {
    this.element.classList.remove('hidden');
    this.updatePodium(podium);
    this.updateCountdown(nextRoundCountdown);
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }

  public updateCountdown(seconds: number): void {
    this.countdownElement.innerText = `PROCHAINE MANCHE DANS ${Math.ceil(seconds)} SECONDES...`;
  }

  private updatePodium(podium: PodiumPlayer[]): void {
    this.podiumContainer.innerHTML = '';

    // Reorganize to standard podium visual order: [2nd, 1st, 3rd]
    const visualOrder: Array<{ spot: 'first' | 'second' | 'third'; index: number }> = [
      { spot: 'second', index: 1 },
      { spot: 'first', index: 0 },
      { spot: 'third', index: 2 },
    ];

    visualOrder.forEach(({ spot, index }) => {
      const p = podium[index];

      const spotDiv = document.createElement('div');
      spotDiv.className = `podium-spot ${spot}`;

      const nameLabel = document.createElement('div');
      nameLabel.className = 'player-name';
      nameLabel.innerText = p ? p.name : '---';

      const scoreLabel = document.createElement('div');
      scoreLabel.className = 'player-score';
      scoreLabel.innerText = p ? `${p.score.toLocaleString()} pts` : '';

      const bar = document.createElement('div');
      bar.className = 'podium-bar';

      let spotLabelText = '1';
      if (spot === 'second') spotLabelText = '2';
      if (spot === 'third') spotLabelText = '3';
      bar.innerText = spotLabelText;

      spotDiv.appendChild(nameLabel);
      spotDiv.appendChild(scoreLabel);
      spotDiv.appendChild(bar);

      this.podiumContainer.appendChild(spotDiv);
    });
  }
}
