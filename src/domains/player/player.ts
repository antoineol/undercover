/**
 * Player Domain - Player Entity
 * Represents a player with their role and game state
 */

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

export interface RoleAssignment {
  playerId: string;
  role: 'undercover' | 'civilian' | 'mr_white';
}
