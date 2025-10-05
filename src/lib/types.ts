import type { Id } from "cvx/dataModel";

// Core game types
export interface Player {
  _id: Id<"players">;
  roomId: Id<"rooms">;
  name: string;
  sessionId?: string;
  isHost: boolean;
  isAlive: boolean;
  role: PlayerRole;
  votes: Id<"players">[];
  sharedWord?: string;
  hasSharedWord?: boolean;
  createdAt: number;
}

export interface Room {
  _id: Id<"rooms">;
  code: string;
  hostId: string;
  gameState: GameState;
  currentRound: number;
  maxRounds: number;
  currentPlayerIndex?: number;
  playerOrder?: Id<"players">[];
  numMrWhites?: number;
  numUndercovers?: number;
  createdAt: number;
  players: Player[];
}

export interface GameWords {
  _id: Id<"gameWords">;
  roomId: Id<"rooms">;
  civilianWord: string;
  undercoverWord: string;
  mrWhiteWord?: string;
  createdAt: number;
}

// Enums and union types
export type GameState =
  | "waiting"
  | "discussion"
  | "voting"
  | "mr_white_guessing"
  | "results";
export type PlayerRole = "civilian" | "undercover" | "mr_white";
export type GameResult =
  | "civilians_win"
  | "undercovers_win"
  | "mr_white_win"
  | "undercovers_mrwhite_win"
  | "max_rounds_reached";

// API response types
export interface CreateRoomResponse {
  roomId: Id<"rooms">;
  roomCode: string;
  sessionId: string;
}

export interface JoinRoomResponse {
  roomId: Id<"rooms">;
  playerId: Id<"players">;
  sessionId: string;
  isExisting: boolean;
}

export interface ShareWordResponse {
  success: boolean;
  allShared: boolean;
  nextPlayer: Id<"players"> | null;
}

export interface VoteResponse {
  success: boolean;
  allVoted: boolean;
  eliminatedPlayer?: Id<"players">;
  gameResult?: GameResult;
  voteCounts?: Record<string, number>;
}

export interface GameValidationResponse {
  gameState: GameState;
  action: string;
  gameResult?: GameResult;
  alivePlayers: number;
  aliveUndercovers: number;
  aliveCivilians: number;
  aliveMrWhite: number;
}

// Component prop types
export interface GameRoomProps {
  roomCode: Id<"rooms">;
  playerName: string;
  isHost: boolean;
  onLeave: () => void;
}

export interface RoomLobbyProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (roomCode: string, name: string) => void;
}

export interface JoinRoomFormProps {
  onJoin: (name: string, isHost?: boolean) => void;
  error: string;
  room: Room;
}

// Game logic types
export interface GameConfiguration {
  numUndercovers: number;
  numMrWhites: number;
}

export type VoteCounts = Record<string, number>;

export type VoterNames = Record<string, string[]>;

export interface PlayerCounts {
  alive: number;
  undercovers: number;
  civilians: number;
  mrWhite: number;
}

// Error types
export interface GameError extends Error {
  code: string;
  details?: Record<string, unknown>;
}

// Utility types
export type RetryFunction<T> = () => Promise<T>;
export type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
};
