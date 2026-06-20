import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { ClientToServerEvents, ServerToClientEvents, GamePhase } from 'shared';
import { EntityManager } from './engine/EntityManager.js';
import { PhysicsEngine } from './engine/PhysicsEngine.js';
import { GameLoop } from './engine/GameLoop.js';
import { NetworkBroadcaster } from './engine/NetworkBroadcaster.js';
import { validateUsername, RateLimiter } from './validation.js';

const app = express();
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send({ status: 'ok', playersCount: Object.keys(entityManager.players).length });
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// core engine instances
const entityManager = new EntityManager();
const physicsEngine = new PhysicsEngine();
const broadcaster = new NetworkBroadcaster(io);

// Throttlers
const moveLimiter = new RateLimiter();
const dashLimiter = new RateLimiter();

// Keep track of previous phase to detect transitions
let previousPhase: GamePhase = 'playing';

// Create Game Loop
const gameLoop = new GameLoop(entityManager, physicsEngine, (snapshot) => {
  // Phase transition logic
  if (snapshot.phase !== previousPhase) {
    if (snapshot.phase === 'post-match') {
      const podium = entityManager.getPodium();
      broadcaster.broadcastMatchEnd(podium);
    } else if (snapshot.phase === 'playing') {
      broadcaster.broadcastMatchStart();
    }
    previousPhase = snapshot.phase;
  }

  // Broadcast state to all connected clients
  broadcaster.broadcastState(snapshot);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connecté : ${socket.id}`);

  socket.on('join', (name, callback) => {
    const validation = validateUsername(name);
    if (!validation.isValid) {
      return callback(false, validation.error);
    }

    // Check if player name is already in use (optional but good practice)
    const normalizedName = name.trim();
    const nameExists = Object.values(entityManager.players).some(
      (p) => p.name.toLowerCase() === normalizedName.toLowerCase(),
    );

    if (nameExists) {
      return callback(false, 'Ce pseudo est déjà utilisé par un autre joueur.');
    }

    // Add player to game state
    entityManager.addPlayer(socket.id, normalizedName);
    console.log(`Joueur '${normalizedName}' a rejoint la partie (${socket.id})`);
    callback(true);
  });

  socket.on('move', (angle) => {
    const player = entityManager.players[socket.id];
    if (!player) return;

    // Throttle movement requests (max ~60/s, so limit 15ms)
    if (!moveLimiter.checkLimit(socket.id, 15)) {
      return;
    }

    // Update player angle
    if (!isNaN(angle)) {
      player.angle = angle;
    }
  });

  socket.on('dash', () => {
    const player = entityManager.players[socket.id];
    if (!player) return;

    // Throttle dash requests (max 1 dash attempt per 200ms)
    if (!dashLimiter.checkLimit(socket.id, 200)) {
      return;
    }

    // PhysicsEngine trigger dash handles check for 100% charge and stun
    physicsEngine.triggerDash(player);
  });

  socket.on('disconnect', () => {
    const player = entityManager.players[socket.id];
    if (player) {
      console.log(`Joueur '${player.name}' s'est déconnecté (${socket.id})`);
      entityManager.removePlayer(socket.id);
    }
    moveLimiter.clear(socket.id);
    dashLimiter.clear(socket.id);
  });
});

// Start Game Loop
gameLoop.start();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Serveur de jeu SURGE.io démarré sur le port ${PORT}`);
});
