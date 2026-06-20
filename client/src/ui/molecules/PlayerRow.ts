export class PlayerRow {
  public element: HTMLLIElement;

  constructor(rank: number, name: string, score: number, isSelf: boolean) {
    this.element = document.createElement('li');
    this.element.className = 'leaderboard-row';
    if (isSelf) {
      this.element.classList.add('self');
    }

    const rankSpan = document.createElement('span');
    rankSpan.className = `leaderboard-rank top-${rank}`;
    rankSpan.innerText = `#${rank}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'leaderboard-name';
    nameSpan.innerText = name;

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'leaderboard-score';
    scoreSpan.innerText = score.toLocaleString();

    this.element.appendChild(rankSpan);
    this.element.appendChild(nameSpan);
    this.element.appendChild(scoreSpan);
  }
}
