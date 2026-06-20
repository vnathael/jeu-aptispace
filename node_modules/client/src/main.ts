import { GameState } from './state/GameState.js';
import { InputController } from './input/InputController.js';
import { NetworkClient } from './network/NetworkClient.js';
import { Renderer } from './renderer/Renderer.js';
import { ConnectionStatus, MainMenu, HUD, Leaderboard, RoundEndModal } from './ui/index.js';

// 1. Initialize State
const gameState = new GameState();

// 2. Initialize UI Components
const connectionStatus = new ConnectionStatus(false);
const connContainer = document.getElementById('connection-status-container');
if (connContainer) {
  connContainer.appendChild(connectionStatus.element);
}

const hud = new HUD('hud-container');
const leaderboard = new Leaderboard('leaderboard-container');
const roundEndModal = new RoundEndModal('round-end-container');

// Flag to track whether the player has joined the game arena
let hasJoined = false;

// 3. Initialize Input Controller (inactive until join)
const inputController = new InputController(
  (angle) => {
    if (hasJoined) {
      networkClient.sendMove(angle);
    }
  },
  () => {
    if (hasJoined) {
      networkClient.sendDash();
    }
  },
);

// 4. Initialize Network Client
const networkClient = new NetworkClient({
  onStateUpdate: (snapshot) => {
    // Keep track of socket ID
    const socketId = networkClient.getSocketId();
    gameState.myPlayerId = socketId;

    // Update local game state
    gameState.update(snapshot);

    const myPlayer = gameState.getMyPlayer();

    // UI overlays logic
    if (hasJoined && myPlayer) {
      if (snapshot.phase === 'playing') {
        roundEndModal.hide();
        hud.show();
        leaderboard.show();
        hud.update(myPlayer.score, myPlayer.charge, snapshot.timer);
      } else if (snapshot.phase === 'post-match') {
        hud.hide();
        leaderboard.hide();
        // The modal is shown in the onMatchEnd event, but we keep it updated with the server timer here
        roundEndModal.updateCountdown(snapshot.timer);
      }

      // Keep leaderboard updated in real-time
      leaderboard.update(snapshot.players, socketId);
    }
  },
  onMatchStart: () => {
    if (hasJoined) {
      roundEndModal.hide();
      hud.show();
      leaderboard.show();
    }
  },
  onMatchEnd: (podium) => {
    if (hasJoined) {
      hud.hide();
      leaderboard.hide();
      // Show podium with initial timer (e.g. 10s)
      roundEndModal.show(podium, gameState.timer);
    }
  },
  onStatusChange: (connected) => {
    connectionStatus.setStatus(connected);
    if (!connected) {
      // If server disconnects, force back to menu
      hasJoined = false;
      inputController.disable();
      hud.hide();
      leaderboard.hide();
      roundEndModal.hide();
      mainMenu.show();
      mainMenu.setError('Connexion perdue avec le serveur.');
    }
  },
});

// 5. Initialize Main Menu
const mainMenu = new MainMenu('main-menu-container', async (username) => {
  if (!networkClient.isConnected()) {
    mainMenu.setError('Impossible de rejoindre. Le serveur est injoignable.');
    return;
  }

  const success = await networkClient.join(username);
  if (success) {
    hasJoined = true;
    mainMenu.hide();
    hud.show();
    leaderboard.show();
    inputController.enable();
  } else {
    mainMenu.setError('Pseudo incorrect ou déjà utilisé par un autre pilote.');
  }
});

// 6. Initialize Renderer and Start Game Canvas Loop
const canvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvasElement, gameState);

// Connect Network Client and Start Renderer Loop
networkClient.connect();
renderer.start();
mainMenu.show();
