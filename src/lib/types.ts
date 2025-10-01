// Core game types
export interface Player {
  _id: string;
  roomId: string;
  name: string;
  sessionId?: string;
  isHost: boolean;
  isAlive: boolean;
  role: PlayerRole;
  votes: string[];
  sharedWord?: string;
  hasSharedWord?: boolean;
  createdAt: number;
}

export interface Room {
  _id: string;
  code: string;
  hostId: string;
  gameState: GameState;
  currentRound: number;
  maxRounds: number;
  currentPlayerIndex?: number;
  playerOrder?: string[];
  hasMrWhite?: boolean;
  numUndercovers?: number;
  createdAt: number;
  players: Player[];
}

export interface GameWords {
  _id: string;
  roomId: string;
  civilianWord: string;
  undercoverWord: string;
  mrWhiteWord?: string;
  createdAt: number;
}

// Enums and union types
export type GameState = "waiting" | "discussion" | "voting" | "results";
export type PlayerRole = "civilian" | "undercover" | "mr_white";
export type GameResult =
  | "civilians_win"
  | "undercovers_win"
  | "mr_white_win"
  | "undercovers_mrwhite_win"
  | "max_rounds_reached";

// API response types
export interface CreateRoomResponse {
  roomId: string;
  roomCode: string;
  sessionId: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
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
  eliminatedPlayer?: string;
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
  room: Room;
}

// Game logic types
export interface GameConfiguration {
  numUndercovers: number;
  hasMrWhite: boolean;
}

export interface VoteCounts {
  [playerId: string]: number;
}

export interface VoterNames {
  [playerId: string]: string[];
}

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
