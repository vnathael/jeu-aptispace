import { io, Socket } from 'socket.io-client';
import { GameStateSnapshot, ClientToServerEvents, ServerToClientEvents } from 'shared';

export class NetworkClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  private onStateUpdateCb?: (state: GameStateSnapshot) => void;
  private onMatchStartCb?: () => void;
  private onMatchEndCb?: (podium: Array<{ id: string; name: string; score: number }>) => void;
  private onStatusChangeCb?: (connected: boolean) => void;

  constructor(callbacks: {
    onStateUpdate: (state: GameStateSnapshot) => void;
    onMatchStart: () => void;
    onMatchEnd: (podium: Array<{ id: string; name: string; score: number }>) => void;
    onStatusChange: (connected: boolean) => void;
  }) {
    this.onStateUpdateCb = callbacks.onStateUpdate;
    this.onMatchStartCb = callbacks.onMatchStart;
    this.onMatchEndCb = callbacks.onMatchEnd;
    this.onStatusChangeCb = callbacks.onStatusChange;
  }

  public connect(): void {
    // Read the server URL from environment variables, fallback to local host
    const serverUrl =
      import.meta.env.VITE_SERVER_URL ||
      `${window.location.protocol}//${window.location.hostname}:3000`;

    console.log(`Tentative de connexion au serveur SURGE.io à : ${serverUrl}`);

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur de jeu !');
      this.onStatusChangeCb?.(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur.');
      this.onStatusChangeCb?.(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket :', error);
      this.onStatusChangeCb?.(false);
    });

    // Game events
    this.socket.on('stateUpdate', (snapshot) => {
      this.onStateUpdateCb?.(snapshot);
    });

    this.socket.on('matchStart', () => {
      this.onMatchStartCb?.();
    });

    this.socket.on('matchEnd', (podium) => {
      this.onMatchEndCb?.(podium);
    });
  }

  public join(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve(false);
        return;
      }

      this.socket.emit('join', name, (success, error) => {
        if (!success && error) {
          console.warn(`Rejet de connexion par le serveur : ${error}`);
        }
        resolve(success);
      });
    });
  }

  public sendMove(angle: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('move', angle);
    }
  }

  public sendDash(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('dash');
    }
  }

  public getSocketId(): string | null {
    return this.socket?.id || null;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
