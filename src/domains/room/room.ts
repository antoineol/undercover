/**
 * Room Domain - Room Entity
 * Represents a game room with its state and configuration
 */

export interface Room {
  _id: string;
  code: string;
  hostId: string;
  gameState:
    | "waiting"
    | "discussion"
    | "voting"
    | "mr_white_guessing"
    | "results";
  currentRound: number;
  maxRounds: number;
  currentPlayerIndex?: number;
  playerOrder?: string[];
  numMrWhites?: number;
  numUndercovers?: number;
  createdAt: number;
}

export interface RoomState {
  gameState: string;
  currentRound: number;
  currentPlayerIndex: number;
  playerOrder: string[];
}
