/**
 * Game Domain - Game Logic Service
 * Pure game logic functions for win conditions, voting, and game state
 */

import { type Id } from "../../../convex/_generated/dataModel";
// import { type Id } from "cvx/dataModel";
import { type ConvexPlayer } from "../../lib/convex-types";

export interface PlayerCounts {
  alive: number;
  undercovers: number;
  civilians: number;
  mrWhite: number;
}

export type VoteCounts = Record<string, number>;

export interface VoteResult {
  eliminatedPlayerId: Id<"players"> | null;
  maxVotes: number;
  tie: boolean;
}

export interface GameResult {
  winner: string;
  winnerColor: string;
  winnerMessage: string;
}

/**
 * Calculate player counts by role
 */
export function calculatePlayerCounts(players: ConvexPlayer[]): PlayerCounts {
  const alivePlayers = players.filter((p) => p.isAlive);
  return {
    alive: alivePlayers.length,
    undercovers: alivePlayers.filter((p) => p.role === "undercover").length,
    civilians: alivePlayers.filter((p) => p.role === "civilian").length,
    mrWhite: alivePlayers.filter((p) => p.role === "mr_white").length,
  };
}

/**
 * Check win conditions based on player counts
 */
export function checkWinConditions(counts: PlayerCounts): string | null {
  const { undercovers, civilians, mrWhite } = counts;

  // Civilians win if all undercovers AND all Mr. White are eliminated
  if (undercovers === 0 && mrWhite === 0) {
    return "civilians_win";
  }

  // Joint victory: Undercovers + Mr. White win if all civilians eliminated
  if (civilians === 0 && undercovers > 0 && mrWhite > 0) {
    return "undercovers_mrwhite_win";
  }

  // Undercovers win if only 1 civilian remains (or less)
  if (civilians <= 1 && undercovers > 0) {
    return "undercovers_win";
  }

  // Mr. White wins if only 1 civilian remains (or less) and Mr. White is alive
  if (civilians <= 1 && mrWhite > 0) {
    return "mr_white_win";
  }

  return null;
}

/**
 * Count votes for each player
 */
export function countVotes(players: ConvexPlayer[]): VoteCounts {
  const voteCounts: VoteCounts = {};
  players.forEach((player) => {
    player.votes.forEach((voteId: Id<"players">) => {
      voteCounts[voteId] = (voteCounts[voteId] ?? 0) + 1;
    });
  });
  return voteCounts;
}

/**
 * Find player with most votes
 */
export function findEliminatedPlayer(voteCounts: VoteCounts): VoteResult {
  let eliminatedPlayerId: Id<"players"> | null = null;
  let maxVotes = 0;
  let tie = false;

  for (const [playerId, votes] of Object.entries(voteCounts)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminatedPlayerId = playerId as Id<"players">;
      tie = false;
    } else if (votes === maxVotes && votes > 0) {
      tie = true;
    }
  }

  return { eliminatedPlayerId, maxVotes, tie };
}

/**
 * Get voter names for each player
 */
export function getVoterNames(
  players: ConvexPlayer[],
): Record<string, string[]> {
  const voterNames: Record<string, string[]> = {};

  players.forEach((player) => {
    player.votes.forEach((voteId: string) => {
      voterNames[voteId] ??= [];
      voterNames[voteId].push(player.name);
    });
  });

  return voterNames;
}

/**
 * Check if all alive players have completed an action
 */
export function allPlayersCompletedAction(
  players: ConvexPlayer[],
  action: "sharedWord" | "voted",
): boolean {
  return players.every((p) => {
    if (action === "sharedWord") {
      return p.hasSharedWord === true;
    } else if (action === "voted") {
      return p.hasVoted === true;
    }
    return false;
  });
}

/**
 * Determine winner from game state
 */
export function determineWinner(alivePlayers: ConvexPlayer[]): GameResult {
  const aliveUndercovers = alivePlayers.filter((p) => p.role === "undercover");
  const aliveCivilians = alivePlayers.filter((p) => p.role === "civilian");
  const aliveMrWhite = alivePlayers.filter((p) => p.role === "mr_white");

  if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
    return {
      winner: "Les civils",
      winnerColor: "text-blue-600",
      winnerMessage:
        "Les civils ont éliminé tous les Undercovers et Mr. White !",
    };
  }

  if (
    aliveUndercovers.length >= aliveCivilians.length &&
    aliveMrWhite.length === 0
  ) {
    return {
      winner: "Les undercovers",
      winnerColor: "text-red-600",
      winnerMessage: "Les Undercovers ont survécu et surpassé les civils !",
    };
  }

  if (
    aliveMrWhite.length > 0 &&
    aliveCivilians.length > 0 &&
    aliveUndercovers.length === 0 &&
    alivePlayers.length === 2
  ) {
    return {
      winner: "Mr. White",
      winnerColor: "text-gray-600",
      winnerMessage: "Mr. White a survécu jusqu'à la fin !",
    };
  }

  if (
    aliveCivilians.length === 0 &&
    aliveUndercovers.length > 0 &&
    aliveMrWhite.length > 0
  ) {
    return {
      winner: "Les undercovers & Mr. White",
      winnerColor: "text-purple-600",
      winnerMessage:
        "Les Undercovers et Mr. White ont éliminé tous les civils !",
    };
  }

  return {
    winner: "Personne",
    winnerColor: "text-gray-600",
    winnerMessage:
      "Le jeu s'est terminé sans vainqueur clair. Veuillez recommencer.",
  };
}

/**
 * Get role display information
 */
export function getRoleDisplay(role: string) {
  const roleMap = {
    undercover: { name: "Undercover", color: "bg-red-100 text-red-800" },
    mr_white: { name: "Mr. White", color: "bg-gray-100 text-gray-800" },
    civilian: { name: "Civil", color: "bg-blue-100 text-blue-800" },
  };

  return (
    roleMap[role as keyof typeof roleMap] || {
      name: role,
      color: "bg-gray-100 text-gray-800",
    }
  );
}
