/**
 * Utilities Domain - Utilities Entity
 * Represents utility types and interfaces
 */

export interface GameConfig {
  ROOM_CODE_LENGTH: number;
  SESSION_ID_LENGTH: number;
  MAX_PLAYER_NAME_LENGTH: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export interface RetryFunction<T> {
  (): Promise<T>;
}

export interface GameError extends Error {
  code: string;
  details?: Record<string, unknown>;
}
