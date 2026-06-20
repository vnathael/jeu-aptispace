export class NetworkBroadcaster {
    io;
    constructor(io) {
        this.io = io;
    }
    /**
     * Broadcasts the current game state snapshot to all connected clients.
     */
    broadcastState(snapshot) {
        this.io.emit('stateUpdate', snapshot);
    }
    /**
     * Notifies all clients that the match has ended and sends the final podium.
     */
    broadcastMatchEnd(podium) {
        this.io.emit('matchEnd', podium);
    }
    /**
     * Notifies all clients that a new match is starting.
     */
    broadcastMatchStart() {
        this.io.emit('matchStart');
    }
}
//# sourceMappingURL=NetworkBroadcaster.js.map