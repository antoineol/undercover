/**
 * Validation Domain - Validation Service
 * Pure functions for input validation and game state validation
 */

import { ValidationResult, GameConfig } from './validation';

/**
 * Validate player name
 */
export function validatePlayerName(
  name: string,
  config: GameConfig
): ValidationResult {
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

  if (trimmedName.length > config.MAX_PLAYER_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Le nom ne peut pas dépasser ${config.MAX_PLAYER_NAME_LENGTH} caractères`,
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
export function validateRoomCode(
  code: string,
  config: GameConfig
): ValidationResult {
  if (!code || code.trim().length === 0) {
    return { isValid: false, error: 'Le code de la salle est requis' };
  }

  const trimmedCode = code.trim().toUpperCase();

  // Check if code contains only valid characters first
  const validChars = /^[A-Z0-9]+$/;
  if (!validChars.test(trimmedCode)) {
    return {
      isValid: false,
      error:
        'Le code de la salle ne peut contenir que des lettres majuscules et des chiffres',
    };
  }

  if (trimmedCode.length !== config.ROOM_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Le code de la salle doit contenir exactement ${config.ROOM_CODE_LENGTH} caractères`,
    };
  }

  return { isValid: true };
}

/**
 * Validate word to share
 */
export function validateSharedWord(
  word: string,
  config: GameConfig
): ValidationResult {
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

  if (trimmedWord.length > config.MAX_WORD_LENGTH) {
    return {
      isValid: false,
      error: `Le mot ne peut pas dépasser ${config.MAX_WORD_LENGTH} caractères`,
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
  hasMrWhite: boolean,
  config: GameConfig
): ValidationResult {
  if (playerCount < config.MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Le jeu nécessite au moins ${config.MIN_PLAYERS} joueurs`,
    };
  }

  if (playerCount > config.MAX_PLAYERS) {
    return {
      isValid: false,
      error: `Le jeu ne peut pas dépasser ${config.MAX_PLAYERS} joueurs`,
    };
  }

  if (numUndercovers < config.MIN_UNDERCOVERS) {
    return {
      isValid: false,
      error: `Il faut au moins ${config.MIN_UNDERCOVERS} undercover`,
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

  const maxUndercovers = Math.floor(playerCount * config.MAX_UNDERCOVERS_RATIO);
  if (numUndercovers > maxUndercovers) {
    return {
      isValid: false,
      error: `Trop d'undercovers. Maximum: ${maxUndercovers}`,
    };
  }

  if (hasMrWhite && playerCount < config.MR_WHITE_MIN_PLAYERS) {
    return {
      isValid: false,
      error: `Mr. White nécessite au moins ${config.MR_WHITE_MIN_PLAYERS} joueurs`,
    };
  }

  return { isValid: true };
}

/**
 * Validate session ID format
 */
export function validateSessionId(
  sessionId: string,
  config: GameConfig
): ValidationResult {
  if (!sessionId) {
    return { isValid: false, error: 'Session ID invalide' };
  }

  const validChars = /^[A-Za-z0-9]+$/;
  if (!validChars.test(sessionId)) {
    return {
      isValid: false,
      error: 'Session ID contient des caractères invalides',
    };
  }

  if (sessionId.length !== config.SESSION_ID_LENGTH) {
    return { isValid: false, error: 'Session ID invalide' };
  }

  return { isValid: true };
}

/**
 * Validate player can share word
 */
export function canShareWord(
  player: any,
  room: any,
  playerId: string
): { canShare: boolean; error?: string } {
  if (!player || !player.isAlive) {
    return { canShare: false, error: 'Player not found or not alive' };
  }

  if (room.gameState !== 'discussion') {
    return { canShare: false, error: 'Game is not in discussion phase' };
  }

  if (!room.playerOrder || room.currentPlayerIndex === undefined) {
    return { canShare: false, error: 'Game not properly initialized' };
  }

  const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
  if (currentPlayerId !== playerId) {
    return { canShare: false, error: "It's not your turn to share a word" };
  }

  if (player.hasSharedWord === true) {
    return { canShare: false, error: 'You have already shared your word' };
  }

  return { canShare: true };
}

/**
 * Validate player can vote
 */
export function canVote(
  voter: any,
  target: any,
  room: any
): { canVote: boolean; error?: string } {
  if (!voter || !target || !voter.isAlive || !target.isAlive) {
    return { canVote: false, error: 'Invalid vote' };
  }

  if (room.gameState !== 'voting') {
    return { canVote: false, error: 'Voting is not active' };
  }

  if (voter.roomId !== target.roomId) {
    return { canVote: false, error: 'Players not in same room' };
  }

  return { canVote: true };
}
