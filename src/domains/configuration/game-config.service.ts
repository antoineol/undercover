/**
 * Configuration Domain - Game Configuration Service
 * Pure functions for game configuration validation and setup
 */

import {
  type GameConfig,
  type GameConfigValidation,
  type GameSetup,
} from "./game-config";

/**
 * Validate game configuration
 */
export function validateGameConfiguration(
  playerCount: number,
  numUndercovers: number,
  numMrWhites: number,
  config: GameConfig,
): GameConfigValidation {
  if (playerCount < config.MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Need at least ${config.MIN_PLAYERS} players to start`,
    };
  }

  if (playerCount > config.MAX_PLAYERS) {
    return {
      isValid: false,
      error: `Too many players. Maximum is ${config.MAX_PLAYERS}`,
    };
  }

  if (numUndercovers < config.MIN_UNDERCOVERS) {
    return {
      isValid: false,
      error: `Need at least ${config.MIN_UNDERCOVERS} undercover`,
    };
  }

  const maxUndercovers = Math.floor(playerCount * config.MAX_UNDERCOVERS_RATIO);
  if (numUndercovers > maxUndercovers) {
    return {
      isValid: false,
      error: `Too many undercovers. Maximum is ${maxUndercovers}`,
    };
  }

  const totalSpecialRoles = numUndercovers + numMrWhites;
  if (totalSpecialRoles >= playerCount) {
    return {
      isValid: false,
      error:
        "Need at least 1 civilian player. Reduce undercovers or Mr. Whites.",
    };
  }

  if (numMrWhites > 0 && playerCount < config.MR_WHITE_MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Mr. White requires at least ${config.MR_WHITE_MIN_PLAYERS} players`,
    };
  }

  return { isValid: true };
}

/**
 * Get default game configuration
 */
export function getDefaultGameSetup(config: GameConfig): GameSetup {
  return {
    numUndercovers: 1,
    numMrWhites: 0,
    maxRounds: config.MAX_ROUNDS,
  };
}

/**
 * Calculate optimal number of undercovers based on player count
 */
export function calculateOptimalUndercovers(
  playerCount: number,
  config: GameConfig,
): number {
  const maxUndercovers = Math.floor(playerCount * config.MAX_UNDERCOVERS_RATIO);
  // const minUndercovers = config.MIN_UNDERCOVERS;

  // Return a balanced number of undercovers
  if (playerCount <= 4) return 1;
  if (playerCount <= 6) return 2;
  if (playerCount <= 8) return 3;

  return Math.min(maxUndercovers, Math.floor(playerCount / 3));
}

/**
 * Check if Mr. White should be enabled based on player count
 */
export function shouldEnableMrWhite(
  playerCount: number,
  config: GameConfig,
): boolean {
  return playerCount >= config.MR_WHITE_MIN_PLAYERS;
}

/**
 * Get maximum number of undercovers for given player count
 */
export function getMaxUndercovers(
  playerCount: number,
  config: GameConfig,
): number {
  return Math.floor(playerCount * config.MAX_UNDERCOVERS_RATIO);
}

/**
 * Get minimum number of undercovers
 */
export function getMinUndercovers(config: GameConfig): number {
  return config.MIN_UNDERCOVERS;
}

/**
 * Check if game configuration is valid for starting
 */
export function canStartGame(
  playerCount: number,
  numUndercovers: number,
  numMrWhites: number,
  config: GameConfig,
): boolean {
  const validation = validateGameConfiguration(
    playerCount,
    numUndercovers,
    numMrWhites,
    config,
  );
  return validation.isValid;
}

/**
 * Get game configuration suggestions based on player count
 */
export function getGameConfigurationSuggestions(
  playerCount: number,
  config: GameConfig,
): {
  suggestedUndercovers: number;
  suggestedMrWhite: boolean;
  maxUndercovers: number;
  minUndercovers: number;
} {
  return {
    suggestedUndercovers: calculateOptimalUndercovers(playerCount, config),
    suggestedMrWhite: shouldEnableMrWhite(playerCount, config),
    maxUndercovers: getMaxUndercovers(playerCount, config),
    minUndercovers: getMinUndercovers(config),
  };
}

/**
 * Validate room capacity
 */
export function validateRoomCapacity(
  currentPlayers: number,
  maxPlayers: number,
): GameConfigValidation {
  if (currentPlayers >= maxPlayers) {
    return {
      isValid: false,
      error: "Room is full",
    };
  }

  return { isValid: true };
}

/**
 * Check if room has enough players to start
 */
export function hasEnoughPlayersToStart(
  playerCount: number,
  config: GameConfig,
): boolean {
  return playerCount >= config.MIN_PLAYERS;
}

/**
 * Get player count status
 */
export function getPlayerCountStatus(
  playerCount: number,
  config: GameConfig,
): {
  canStart: boolean;
  needsMorePlayers: boolean;
  isFull: boolean;
  statusText: string;
} {
  const canStart = hasEnoughPlayersToStart(playerCount, config);
  const needsMorePlayers = playerCount < config.MIN_PLAYERS;
  const isFull = playerCount >= config.MAX_PLAYERS;

  let statusText = "";
  if (needsMorePlayers) {
    statusText = `Need ${config.MIN_PLAYERS - playerCount} more players to start`;
  } else if (isFull) {
    statusText = "Room is full";
  } else if (canStart) {
    statusText = "Ready to start";
  }

  return {
    canStart,
    needsMorePlayers,
    isFull,
    statusText,
  };
}
