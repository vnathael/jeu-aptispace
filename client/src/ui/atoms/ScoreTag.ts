export class ScoreTag {
  public element: HTMLDivElement;
  private labelElement: HTMLSpanElement;
  private valueElement: HTMLSpanElement;

  constructor(label: string = 'Score', initialScore: number = 0) {
    this.element = document.createElement('div');
    this.element.className = 'hud-stat';

    this.labelElement = document.createElement('span');
    this.labelElement.className = 'hud-stat-label';
    this.labelElement.innerText = label;

    this.valueElement = document.createElement('span');
    this.valueElement.className = 'hud-stat-value';
    this.valueElement.innerText = initialScore.toString();

    this.element.appendChild(this.labelElement);
    this.element.appendChild(this.valueElement);
  }

  public setScore(score: number): void {
    // If score changed, trigger a slight flash or scale animation
    const oldScore = parseInt(this.valueElement.innerText);
    if (oldScore !== score) {
      this.valueElement.innerText = score.toString();

      // Micro-animation: flash text scale
      this.valueElement.animate(
        [
          { transform: 'scale(1.25)', color: '#06b6d4' },
          { transform: 'scale(1)', color: '#ffffff' },
        ],
        { duration: 250, easing: 'ease-out' },
      );
    }
  }
}
