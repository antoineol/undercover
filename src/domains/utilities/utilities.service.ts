/**
 * Utilities Domain - Utilities Service
 * Pure utility functions for common operations
 */

import { GameConfig, RetryConfig, GameError } from './utilities';

/**
 * Generate a random room code
 */
export function generateRoomCode(config: GameConfig): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < config.ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random session ID
 */
export function generateSessionId(config: GameConfig): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < config.SESSION_ID_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string, maxLength: number = 50): string {
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
 * Create custom error with code
 */
export function createGameError(
  message: string,
  code: string,
  details?: Record<string, unknown>
): GameError {
  const error = new Error(message) as GameError;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Calculate delay for retry with exponential backoff
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig
): number {
  return Math.min(
    config.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
    config.maxDelay
  );
}

/**
 * Check if error is retryable (concurrent access error)
 */
export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return false;
  }
  const errorMessage = (error as { message: string }).message;
  return errorMessage.includes('Documents read from or written to');
}

/**
 * Format player counts for display
 */
export function formatPlayerCounts(counts: {
  alive: number;
  undercovers: number;
  civilians: number;
  mrWhite: number;
}): string {
  const parts = [];
  if (counts.undercovers > 0)
    parts.push(
      `${counts.undercovers} undercover${counts.undercovers > 1 ? 's' : ''}`
    );
  if (counts.civilians > 0)
    parts.push(`${counts.civilians} civil${counts.civilians > 1 ? 's' : ''}`);
  if (counts.mrWhite > 0) parts.push(`${counts.mrWhite} Mr. White`);

  return parts.join(', ');
}

/**
 * Get game state display text
 */
export function getGameStateDisplay(gameState: string): string {
  const stateMap: Record<string, string> = {
    waiting: 'En attente',
    discussion: 'Discussion',
    voting: 'Vote',
    results: 'Résultats',
  };

  return stateMap[gameState] || gameState;
}

/**
 * Check if game is in active state
 */
export function isGameActive(gameState: string): boolean {
  return ['discussion', 'voting'].includes(gameState);
}

/**
 * Check if game is finished
 */
export function isGameFinished(gameState: string): boolean {
  return gameState === 'results';
}

/**
 * Get round display text
 */
export function getRoundDisplay(
  currentRound: number,
  maxRounds: number
): string {
  return `Round ${currentRound}/${maxRounds}`;
}

/**
 * Check if max rounds reached
 */
export function isMaxRoundsReached(
  currentRound: number,
  maxRounds: number
): boolean {
  return currentRound >= maxRounds;
}
