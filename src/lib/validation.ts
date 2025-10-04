import {
  sanitizeHtml as pureSanitizeHtml,
  sanitizeInput as pureSanitizeInput,
} from "../domains/utilities/utilities.service";
import {
  validateGameConfig as pureValidateGameConfig,
  validatePlayerName as pureValidatePlayerName,
  validateRoomCode as pureValidateRoomCode,
  validateSessionId as pureValidateSessionId,
  validateSharedWord as pureValidateSharedWord,
} from "../domains/validation/validation.service";
import { GAME_CONFIG } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): ValidationResult {
  return pureValidatePlayerName(name, GAME_CONFIG);
}

/**
 * Validate room code
 */
export function validateRoomCode(code: string): ValidationResult {
  return pureValidateRoomCode(code, GAME_CONFIG);
}

/**
 * Validate word to share
 */
export function validateSharedWord(word: string): ValidationResult {
  return pureValidateSharedWord(word, GAME_CONFIG);
}

/**
 * Validate game configuration
 */
export function validateGameConfig(
  playerCount: number,
  numUndercovers: number,
  numMrWhites: number,
): ValidationResult {
  return pureValidateGameConfig(
    playerCount,
    numUndercovers,
    numMrWhites,
    GAME_CONFIG,
  );
}

/**
 * Sanitize input string
 */
export function sanitizeInput(
  input: string,
  maxLength: number = GAME_CONFIG.MAX_PLAYER_NAME_LENGTH,
): string {
  return pureSanitizeInput(input, maxLength);
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(input: string): string {
  return pureSanitizeHtml(input);
}

/**
 * Validate session ID format
 */
export function validateSessionId(sessionId: string): ValidationResult {
  return pureValidateSessionId(sessionId, GAME_CONFIG);
}
