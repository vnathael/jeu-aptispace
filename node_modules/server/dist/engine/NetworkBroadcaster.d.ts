import { Server } from 'socket.io';
import { GameStateSnapshot } from 'shared';
export declare class NetworkBroadcaster {
    private io;
    constructor(io: Server);
    /**
     * Broadcasts the current game state snapshot to all connected clients.
     */
    broadcastState(snapshot: GameStateSnapshot): void;
    /**
     * Notifies all clients that the match has ended and sends the final podium.
     */
    broadcastMatchEnd(podium: Array<{
        id: string;
        name: string;
        score: number;
    }>): void;
    /**
     * Notifies all clients that a new match is starting.
     */
    broadcastMatchStart(): void;
}
