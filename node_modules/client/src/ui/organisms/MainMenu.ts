import { Input } from '../atoms/Input.js';
import { Button } from '../atoms/Button.js';

export class MainMenu {
  public element: HTMLDivElement;
  private input: Input;
  private button: Button;
  private errorElement: HTMLDivElement;
  private onJoin: (name: string) => void;

  constructor(containerId: string, onJoin: (name: string) => void) {
    const parent = document.getElementById(containerId) as HTMLDivElement;
    if (!parent) throw new Error(`Le conteneur #${containerId} est introuvable.`);
    this.element = parent;
    this.onJoin = onJoin;

    // Outer card
    const card = document.createElement('div');
    card.className = 'main-menu-card glass-panel';

    const title = document.createElement('h1');
    title.className = 'menu-title';
    title.innerText = 'SURGE.io';

    const subtitle = document.createElement('div');
    subtitle.className = 'menu-subtitle';
    subtitle.innerText = 'Reactor Charge Arena';

    // Form
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.innerText = 'Saisis ton pseudo';

    this.input = new Input('Nom de pilote...', 15);
    this.input.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitForm();
      }
    });

    formGroup.appendChild(label);
    formGroup.appendChild(this.input.element);

    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';

    this.button = new Button('REJOINDRE LA PARTIE', () => this.submitForm());
    this.button.element.style.width = '100%';

    // Instructions
    const instructions = document.createElement('div');
    instructions.className = 'instructions-panel';
    instructions.innerHTML = `
      <h4>Comment jouer :</h4>
      <ul>
        <li>Déplace ton réacteur avec le mouvement du curseur</li>
        <li>Collecte les cellules d'énergie vertes pour remplir ta jauge</li>
        <li>Déclenche un Surge Dash avec [ESPACE] ou [TAP] (jauge à 100%)</li>
        <li>Touche un adversaire pendant un Dash pour l'étourdir et voler sa charge</li>
        <li>Évite la zone rouge (Surcharge) qui draine ton énergie</li>
        <li>Collecte les boucliers dorés (Immunité de 5 secondes)</li>
      </ul>
    `;

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(formGroup);
    card.appendChild(this.errorElement);
    card.appendChild(this.button.element);
    card.appendChild(instructions);

    this.element.appendChild(card);
  }

  private submitForm(): void {
    const username = this.input.getValue();
    this.setError('');

    if (username.length < 2) {
      this.setError('Le pseudo doit contenir au moins 2 caractères.');
      return;
    }

    this.button.setEnabled(false);
    this.onJoin(username);
  }

  public setError(msg: string): void {
    this.errorElement.innerText = msg;
    this.button.setEnabled(true);
  }

  public show(): void {
    this.element.classList.remove('hidden');
    this.input.element.focus();
  }

  public hide(): void {
    this.element.classList.add('hidden');
  }
}
