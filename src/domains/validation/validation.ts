/**
 * Validation Domain - Validation Entity
 * Represents validation results and configuration
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface GameConfig {
  MIN_PLAYERS: number;
  MAX_PLAYERS: number;
  MIN_UNDERCOVERS: number;
  MAX_UNDERCOVERS_RATIO: number;
  MR_WHITE_MIN_PLAYERS: number;
  MAX_PLAYER_NAME_LENGTH: number;
  MAX_WORD_LENGTH: number;
  ROOM_CODE_LENGTH: number;
  SESSION_ID_LENGTH: number;
}
