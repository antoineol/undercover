import type { Doc, Id } from "cvx/dataModel";

// Re-export Convex types with proper naming
export type ConvexRoom = Doc<"rooms">;
export type ConvexPlayer = Doc<"players">;
export type ConvexGameWords = Doc<"gameWords">;

export type RoomId = Id<"rooms">;
export type PlayerId = Id<"players">;
export type GameWordsId = Id<"gameWords">;

// Extended types that include computed properties
export interface RoomWithPlayers extends ConvexRoom {
  players: ConvexPlayer[];
}

export interface PlayerWithRoom extends ConvexPlayer {
  room: ConvexRoom;
}

// Type guards for runtime type checking
export function isConvexRoom(obj: unknown): obj is ConvexRoom {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    "code" in obj &&
    "hostId" in obj &&
    "gameState" in obj &&
    "currentRound" in obj &&
    "maxRounds" in obj &&
    "createdAt" in obj
  );
}

export function isConvexPlayer(obj: unknown): obj is ConvexPlayer {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    "roomId" in obj &&
    "name" in obj &&
    "isHost" in obj &&
    "isAlive" in obj &&
    "role" in obj &&
    "votes" in obj &&
    "createdAt" in obj
  );
}

// Utility types for working with Convex data
export type GameState = ConvexRoom["gameState"];
export type PlayerRole = ConvexPlayer["role"];

// Type-safe ID conversion utilities
// These functions should only be used when you have validated that the string is a valid Convex ID
export function toPlayerId(id: string): Id<"players"> {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Invalid player ID");
  }
  return id as Id<"players">;
}

export function toRoomId(id: string): Id<"rooms"> {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Invalid room ID");
  }
  return id as Id<"rooms">;
}

export function toGameWordsId(id: string): Id<"gameWords"> {
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Invalid game words ID");
  }
  return id as Id<"gameWords">;
}

// Convert string array to Convex ID array
export function toPlayerIdArray(ids: string[]): Id<"players">[] {
  return ids.map((id) => toPlayerId(id));
}

// API response types that use Convex types
export interface CreateRoomResponse {
  roomId: RoomId;
  roomCode: string;
  sessionId: string;
}

export interface JoinRoomResponse {
  roomId: RoomId;
  playerId: PlayerId;
  sessionId: string;
  isExisting: boolean;
}

export interface ShareWordResponse {
  success: boolean;
  allShared: boolean;
  nextPlayer: string | null;
}

export interface VoteResponse {
  success: boolean;
  allVoted: boolean;
  eliminatedPlayer?: PlayerId;
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

export type GameResult =
  | "civilians_win"
  | "undercovers_win"
  | "mr_white_win"
  | "undercovers_mrwhite_win"
  | "max_rounds_reached";

// Component prop types
export interface GameRoomProps {
  roomCode: string;
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
  room: RoomWithPlayers;
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
