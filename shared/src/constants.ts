export const GAME_CONSTANTS = {
  // Arena size
  WORLD_WIDTH: 2000,
  WORLD_HEIGHT: 2000,

  // Server tick rate
  TICK_RATE: 30, // 30 updates per second
  TICK_INTERVAL: 1000 / 30, // ~33.3ms

  // Player properties
  PLAYER_RADIUS: 25,
  PLAYER_SPEED: 250, // units per second

  // Charge properties
  MAX_CHARGE: 100,
  CHARGE_CELL_VALUE: 20, // 5 cells to fill charge
  SCORE_PER_CELL: 100,

  // Dash properties
  DASH_SPEED: 850,
  DASH_DURATION: 300, // milliseconds
  DASH_STUN_DURATION: 1000, // milliseconds
  STUN_SPEED_MULTIPLIER: 0.3, // 70% speed reduction
  DASH_CHARGE_LOSS_PERCENT: 0.5, // 50% loss of charge on dash hit

  // Energy Cells
  MAX_ENERGY_CELLS: 40,
  ENERGY_CELL_RADIUS: 10,

  // Overcharge Zone (Red hazard zone)
  OVERCHARGE_SPAWN_INTERVAL: 25000, // Every 25 seconds
  OVERCHARGE_DURATION: 12000, // Lasts 12 seconds
  OVERCHARGE_RADIUS: 160,
  OVERCHARGE_DRAIN_RATE: 30, // charge per second

  // Shield Powerup
  SHIELD_SPAWN_INTERVAL: 20000, // Every 20 seconds
  SHIELD_DURATION: 5000, // 5 seconds of invulnerability
  SHIELD_RADIUS: 15,
  SHIELD_MAX_ACTIVE: 2,

  // Game timer settings
  MATCH_DURATION: 180, // 3 minutes in seconds
  POST_MATCH_COOLDOWN: 10, // 10 seconds before next match
};
