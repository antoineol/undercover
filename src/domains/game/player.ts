/**
 * Game Domain - Player Entity
 * Represents a player in the game with their role and state
 */

import { ConvexPlayer } from '../../lib/convex-types';

export type { ConvexPlayer };

export interface Player {
  _id: string;
  name: string;
  role: 'undercover' | 'civilian' | 'mr_white';
  isAlive: boolean;
  hasSharedWord?: boolean;
  sharedWord?: string;
  votes: string[];
  hasVoted?: boolean;
  roomId: string;
}

export interface PlayerCounts {
  alive: number;
  undercovers: number;
  civilians: number;
  mrWhite: number;
}

export interface VoteCounts {
  [playerId: string]: number;
}

export interface VoteResult {
  eliminatedPlayerId: string | null;
  maxVotes: number;
  tie: boolean;
}

export interface GameResult {
  winner: string;
  winnerColor: string;
  winnerMessage: string;
}
