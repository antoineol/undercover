/**
 * Configuration Domain - Game Configuration Entity
 * Represents game rules and configuration settings
 */

export interface GameConfig {
  MIN_PLAYERS: number;
  MAX_PLAYERS: number;
  MIN_UNDERCOVERS: number;
  MAX_UNDERCOVERS_RATIO: number;
  MR_WHITE_MIN_PLAYERS: number;
  MAX_ROUNDS: number;
}

export interface GameConfigValidation {
  isValid: boolean;
  error?: string;
}

export interface GameSetup {
  numUndercovers: number;
  numMrWhites: number;
  maxRounds: number;
}
