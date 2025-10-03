/**
 * Player Domain - Player Entity
 * Represents a player with their role and game state
 */

import { ConvexPlayer } from '../../lib/convex-types';
import { Id } from '../../../convex/_generated/dataModel';

// Base player interface for domain logic
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

// Extended player interface that includes Convex-specific fields
// This interface exists for future extensibility when we need to add domain-specific fields
export type ConvexPlayerWithDomain = ConvexPlayer;

// Type guard to check if a player is a Convex player
export function isConvexPlayer(
  player: Player | ConvexPlayer
): player is ConvexPlayer {
  return '_creationTime' in player;
}

// Convert ConvexPlayer to domain Player
export function convexPlayerToDomain(convexPlayer: ConvexPlayer): Player {
  return {
    _id: convexPlayer._id,
    name: convexPlayer.name,
    role: convexPlayer.role,
    isAlive: convexPlayer.isAlive,
    hasSharedWord: convexPlayer.hasSharedWord,
    sharedWord: convexPlayer.sharedWord,
    votes: convexPlayer.votes,
    hasVoted: convexPlayer.hasVoted,
    roomId: convexPlayer.roomId,
  };
}

// Convert domain Player to ConvexPlayer (for testing)
export function domainPlayerToConvex(player: Player): ConvexPlayer {
  return {
    _id: player._id as ConvexPlayer['_id'], // Type assertion for testing
    _creationTime: Date.now(),
    roomId: player.roomId as ConvexPlayer['roomId'], // Type assertion for testing
    name: player.name,
    sessionId: undefined,
    isHost: false,
    isAlive: player.isAlive,
    role: player.role,
    votes: player.votes as ConvexPlayer['votes'], // Type assertion for testing
    sharedWord: player.sharedWord,
    hasSharedWord: player.hasSharedWord,
    hasVoted: player.hasVoted,
    createdAt: Date.now(),
  };
}

export interface RoleAssignment {
  playerId: Id<'players'>;
  role: 'undercover' | 'civilian' | 'mr_white';
}
