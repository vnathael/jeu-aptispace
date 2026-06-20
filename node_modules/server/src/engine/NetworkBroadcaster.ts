import { Server } from 'socket.io';
import { GameStateSnapshot } from 'shared';

export class NetworkBroadcaster {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Broadcasts the current game state snapshot to all connected clients.
   */
  public broadcastState(snapshot: GameStateSnapshot): void {
    this.io.emit('stateUpdate', snapshot);
  }

  /**
   * Notifies all clients that the match has ended and sends the final podium.
   */
  public broadcastMatchEnd(podium: Array<{ id: string; name: string; score: number }>): void {
    this.io.emit('matchEnd', podium);
  }

  /**
   * Notifies all clients that a new match is starting.
   */
  public broadcastMatchStart(): void {
    this.io.emit('matchStart');
  }
}
