/**
 * Player Domain - Role Assignment Service
 * Pure functions for role assignment and player ordering
 */

import { Player, RoleAssignment } from './player';

/**
 * Assign roles to players
 */
export function assignRoles(
  players: Player[],
  numUndercovers: number,
  hasMrWhite: boolean
): RoleAssignment[] {
  const shuffledPlayers = shuffleArray(players);
  const roleAssignments: RoleAssignment[] = [];

  for (let i = 0; i < shuffledPlayers.length; i++) {
    let role: 'undercover' | 'civilian' | 'mr_white' = 'civilian';

    if (i < numUndercovers) {
      role = 'undercover';
    } else if (i === numUndercovers && hasMrWhite) {
      role = 'mr_white';
    }

    roleAssignments.push({
      playerId: shuffledPlayers[i]._id,
      role,
    });
  }

  return roleAssignments;
}

/**
 * Create player order for word sharing
 */
export function createPlayerOrder(players: Player[]): string[] {
  const playerOrder = ensureMrWhiteNotFirst([...players]);
  return playerOrder.map(p => p._id);
}

/**
 * Find next alive player in turn order
 */
export function findNextAlivePlayer(
  playerOrder: string[],
  currentIndex: number,
  alivePlayerIds: string[]
): number {
  // Look for next alive player in the order
  for (let i = currentIndex + 1; i < playerOrder.length; i++) {
    if (alivePlayerIds.includes(playerOrder[i])) {
      return i;
    }
  }

  // If no next alive player found, check from the beginning
  for (let i = 0; i < currentIndex; i++) {
    if (alivePlayerIds.includes(playerOrder[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Shuffle array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Ensure Mr. White is not first in player order
 */
export function ensureMrWhiteNotFirst(playerOrder: Player[]): Player[] {
  const mrWhiteIndex = playerOrder.findIndex(p => p.role === 'mr_white');
  if (mrWhiteIndex === 0) {
    // Move Mr. White to a random position (not first)
    const mrWhite = playerOrder.splice(0, 1)[0];
    const randomPosition =
      Math.floor(Math.random() * (playerOrder.length - 1)) + 1;
    playerOrder.splice(randomPosition, 0, mrWhite);
  }
  return playerOrder;
}
