import type { GameError } from "./types";

export class RoomNotFoundError extends Error implements GameError {
  code = "ROOM_NOT_FOUND";
  constructor(roomCode: string) {
    super(`Room with code ${roomCode} not found`);
  }
}

export class GameAlreadyStartedError extends Error implements GameError {
  code = "GAME_ALREADY_STARTED";
  constructor() {
    super("Game has already started");
  }
}

export class RoomFullError extends Error implements GameError {
  code = "ROOM_FULL";
  constructor() {
    super("Room is full");
  }
}

export class PlayerNameExistsError extends Error implements GameError {
  code = "PLAYER_NAME_EXISTS";
  constructor(name: string) {
    super(`A player with name ${name} already exists in the room`);
  }
}

export class InvalidSessionError extends Error implements GameError {
  code = "INVALID_SESSION";
  constructor() {
    super("Invalid session. Please rejoin with a new name.");
  }
}

export class GameNotInDiscussionError extends Error implements GameError {
  code = "GAME_NOT_IN_DISCUSSION";
  constructor() {
    super("Game is not in discussion phase");
  }
}

export class NotYourTurnError extends Error implements GameError {
  code = "NOT_YOUR_TURN";
  constructor() {
    super("It's not your turn to share a word");
  }
}

export class AlreadySharedWordError extends Error implements GameError {
  code = "ALREADY_SHARED_WORD";
  constructor() {
    super("You have already shared your word");
  }
}

export class VotingNotActiveError extends Error implements GameError {
  code = "VOTING_NOT_ACTIVE";
  constructor() {
    super("Voting is not active");
  }
}

export class InvalidVoteError extends Error implements GameError {
  code = "INVALID_VOTE";
  constructor() {
    super("Invalid vote");
  }
}

export class GameNotFinishedError extends Error implements GameError {
  code = "GAME_NOT_FINISHED";
  constructor() {
    super("Game is not finished");
  }
}

export class InsufficientPlayersError extends Error implements GameError {
  code = "INSUFFICIENT_PLAYERS";
  constructor(required: number, actual: number) {
    super(`Need at least ${required} players to start, got ${actual}`);
  }
}

export class TooManyPlayersError extends Error implements GameError {
  code = "TOO_MANY_PLAYERS";
  constructor(max: number, actual: number) {
    super(`Too many players. Maximum is ${max}, got ${actual}`);
  }
}

export class InvalidGameConfigurationError extends Error implements GameError {
  code = "INVALID_GAME_CONFIGURATION";
  constructor(message: string) {
    super(message);
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof RoomNotFoundError) {
    return "Salle introuvable. Vérifiez le code de la salle.";
  }
  if (error instanceof GameAlreadyStartedError) {
    return "La partie a déjà commencé. Vous ne pouvez plus rejoindre cette salle.";
  }
  if (error instanceof RoomFullError) {
    return "La salle est pleine. Maximum 10 joueurs autorisés.";
  }
  if (error instanceof PlayerNameExistsError) {
    return "Un joueur avec ce nom existe déjà dans la salle. Veuillez choisir un autre nom.";
  }
  if (error instanceof InvalidSessionError) {
    return "Session invalide. Veuillez rejoindre avec un nouveau nom.";
  }

  // Generic error message
  return "Une erreur inattendue s'est produite. Veuillez réessayer.";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  return (
    error.message.includes("Documents read from or written to") ||
    error.message.includes("concurrent access") ||
    error.message.includes("network")
  );
}
