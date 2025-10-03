import { GAME_CONFIG } from './constants';
import {
  validatePlayerName as pureValidatePlayerName,
  validateRoomCode as pureValidateRoomCode,
  validateSharedWord as pureValidateSharedWord,
  validateGameConfig as pureValidateGameConfig,
  validateSessionId as pureValidateSessionId,
} from '../domains/validation/validation.service';
import {
  sanitizeInput as pureSanitizeInput,
  sanitizeHtml as pureSanitizeHtml,
} from '../domains/utilities/utilities.service';

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
  hasMrWhite: boolean
): ValidationResult {
  return pureValidateGameConfig(
    playerCount,
    numUndercovers,
    hasMrWhite,
    GAME_CONFIG
  );
}

/**
 * Sanitize input string
 */
export function sanitizeInput(
  input: string,
  maxLength: number = GAME_CONFIG.MAX_PLAYER_NAME_LENGTH
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
