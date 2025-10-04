/**
 * Player Domain - Role Assignment Service
 * Pure functions for role assignment and player ordering
 */

import { type Id } from "../../../convex/_generated/dataModel";
import { type RoleAssignment } from "./player";

// Generic player interface that works with both domain and Convex players
interface PlayerWithId {
  _id: Id<"players">;
  role: "undercover" | "civilian" | "mr_white";
}

/**
 * Assign roles to players
 */
export function assignRoles(
  players: PlayerWithId[],
  numUndercovers: number,
  numMrWhites: number,
): RoleAssignment[] {
  const shuffledPlayers = shuffleArray(players);
  const roleAssignments: RoleAssignment[] = [];

  for (let i = 0; i < shuffledPlayers.length; i++) {
    let role: "undercover" | "civilian" | "mr_white" = "civilian";

    if (i < numUndercovers) {
      role = "undercover";
    } else if (i >= numUndercovers && i < numUndercovers + numMrWhites) {
      role = "mr_white";
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
export function createPlayerOrder(players: PlayerWithId[]): Id<"players">[] {
  const playerOrder = ensureMrWhiteNotFirst([...players]);
  return playerOrder.map((p) => p._id);
}

/**
 * Find next alive player in turn order
 */
export function findNextAlivePlayer(
  playerOrder: Id<"players">[],
  currentIndex: number,
  alivePlayerIds: Id<"players">[],
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
 * Ensure Mr. Whites are not first in player order
 */
export function ensureMrWhiteNotFirst(
  playerOrder: PlayerWithId[],
): PlayerWithId[] {
  const mrWhiteIndices = playerOrder
    .map((p, index) => ({ player: p, index }))
    .filter(({ player }) => player.role === "mr_white");

  // If any Mr. White is first, move all Mr. Whites to random positions (not first)
  if (mrWhiteIndices.some(({ index }) => index === 0)) {
    const mrWhites = mrWhiteIndices.map(({ player }) => player);
    const nonMrWhites = playerOrder.filter((p) => p.role !== "mr_white");

    // Insert Mr. Whites at random positions (not first)
    const result = [...nonMrWhites];
    for (const mrWhite of mrWhites) {
      const randomPosition =
        Math.floor(Math.random() * (result.length - 1)) + 1;
      result.splice(randomPosition, 0, mrWhite);
    }
    return result;
  }

  return playerOrder;
}
