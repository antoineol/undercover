import { GAME_CONFIG } from './constants';
import { createGameError } from './utils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Le nom du joueur est requis' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: 'Le nom doit contenir au moins 2 caractères',
    };
  }

  if (trimmedName.length > GAME_CONFIG.MAX_PLAYER_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Le nom ne peut pas dépasser ${GAME_CONFIG.MAX_PLAYER_NAME_LENGTH} caractères`,
    };
  }

  // Check for invalid characters
  const invalidChars = /[<>\"'&]/;
  if (invalidChars.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Le nom contient des caractères non autorisés',
    };
  }

  return { isValid: true };
}

/**
 * Validate room code
 */
export function validateRoomCode(code: string): ValidationResult {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: 'Le code de la salle est requis' };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length !== GAME_CONFIG.ROOM_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Le code de la salle doit contenir exactement ${GAME_CONFIG.ROOM_CODE_LENGTH} caractères`,
    };
  }

  // Check if code contains only valid characters
  const validChars = /^[A-Z0-9]+$/;
  if (!validChars.test(trimmedCode)) {
    return {
      isValid: false,
      error:
        'Le code de la salle ne peut contenir que des lettres majuscules et des chiffres',
    };
  }

  return { isValid: true };
}

/**
 * Validate word to share
 */
export function validateSharedWord(word: string): ValidationResult {
  if (!word || word.trim().length === 0) {
    return { isValid: false, error: 'Le mot est requis' };
  }

  const trimmedWord = word.trim();

  if (trimmedWord.length < 2) {
    return {
      isValid: false,
      error: 'Le mot doit contenir au moins 2 caractères',
    };
  }

  if (trimmedWord.length > GAME_CONFIG.MAX_WORD_LENGTH) {
    return {
      isValid: false,
      error: `Le mot ne peut pas dépasser ${GAME_CONFIG.MAX_WORD_LENGTH} caractères`,
    };
  }

  // Check for invalid characters
  const invalidChars = /[<>\"'&]/;
  if (invalidChars.test(trimmedWord)) {
    return {
      isValid: false,
      error: 'Le mot contient des caractères non autorisés',
    };
  }

  // Check for multiple words (should be single word)
  if (trimmedWord.includes(' ')) {
    return { isValid: false, error: 'Veuillez entrer un seul mot' };
  }

  return { isValid: true };
}

/**
 * Validate game configuration
 */
export function validateGameConfig(
  playerCount: number,
  numUndercovers: number,
  hasMrWhite: boolean
): ValidationResult {
  if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Le jeu nécessite au moins ${GAME_CONFIG.MIN_PLAYERS} joueurs`,
    };
  }

  if (playerCount > GAME_CONFIG.MAX_PLAYERS) {
    return {
      isValid: false,
      error: `Le jeu ne peut pas dépasser ${GAME_CONFIG.MAX_PLAYERS} joueurs`,
    };
  }

  if (numUndercovers < GAME_CONFIG.MIN_UNDERCOVERS) {
    return {
      isValid: false,
      error: `Il faut au moins ${GAME_CONFIG.MIN_UNDERCOVERS} undercover`,
    };
  }

  const maxUndercovers = Math.floor(
    playerCount * GAME_CONFIG.MAX_UNDERCOVERS_RATIO
  );
  if (numUndercovers > maxUndercovers) {
    return {
      isValid: false,
      error: `Trop d'undercovers. Maximum: ${maxUndercovers}`,
    };
  }

  const totalSpecialRoles = numUndercovers + (hasMrWhite ? 1 : 0);
  if (totalSpecialRoles >= playerCount) {
    return {
      isValid: false,
      error:
        "Il faut au moins 1 joueur civil. Réduisez le nombre d'undercovers ou désactivez Mr. White.",
    };
  }

  if (hasMrWhite && playerCount < GAME_CONFIG.MR_WHITE_MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Mr. White nécessite au moins ${GAME_CONFIG.MR_WHITE_MIN_PLAYERS} joueurs`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize input string
 */
export function sanitizeInput(
  input: string,
  maxLength: number = GAME_CONFIG.MAX_PLAYER_NAME_LENGTH
): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, ''); // Remove potentially dangerous characters
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate session ID format
 */
export function validateSessionId(sessionId: string): ValidationResult {
  if (!sessionId || sessionId.length !== GAME_CONFIG.SESSION_ID_LENGTH) {
    return { isValid: false, error: 'Session ID invalide' };
  }

  const validChars = /^[A-Za-z0-9]+$/;
  if (!validChars.test(sessionId)) {
    return {
      isValid: false,
      error: 'Session ID contient des caractères invalides',
    };
  }

  return { isValid: true };
}
