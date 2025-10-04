import { type Id } from "../../convex/_generated/dataModel";
import {
  allPlayersCompletedAction as pureAllPlayersCompletedAction,
  determineWinner as pureDetermineWinner,
  getRoleDisplay as pureGetRoleDisplay,
} from "../domains/game/game-logic.service";
import {
  assignRoles as pureAssignRoles,
  createPlayerOrder as pureCreatePlayerOrder,
  findNextAlivePlayer as pureFindNextAlivePlayer,
} from "../domains/player/role-assignment.service";
import {
  canShareWord as pureCanShareWord,
  canVote as pureCanVote,
} from "../domains/validation/validation.service";
import { type ConvexPlayer, type ConvexRoom } from "./convex-types";

/**
 * Game flow helpers - pure functions for game logic
 */
export class GameFlowHelpers {
  /**
   * Assign roles to players
   */
  static assignRoles(
    players: ConvexPlayer[],
    numUndercovers: number,
    numMrWhites: number,
  ) {
    // Convert ConvexPlayer to the format expected by pureAssignRoles
    const domainPlayers = players.map((p) => ({
      _id: p._id,
      role: p.role,
    }));
    return pureAssignRoles(domainPlayers, numUndercovers, numMrWhites);
  }

  /**
   * Create player order for word sharing
   */
  static createPlayerOrder(players: ConvexPlayer[]) {
    // Convert ConvexPlayer to the format expected by pureCreatePlayerOrder
    const domainPlayers = players.map((p) => ({
      _id: p._id,
      role: p.role,
    }));
    return pureCreatePlayerOrder(domainPlayers);
  }

  /**
   * Find next player in turn order
   */
  static findNextPlayer(
    playerOrder: Id<"players">[],
    currentIndex: number,
    alivePlayerIds: Id<"players">[],
  ) {
    return pureFindNextAlivePlayer(playerOrder, currentIndex, alivePlayerIds);
  }

  /**
   * Check if all alive players have completed action
   */
  static allPlayersCompletedAction(
    players: ConvexPlayer[],
    action: "sharedWord" | "voted",
  ): boolean {
    return pureAllPlayersCompletedAction(players, action);
  }
}

/**
 * Game validation helpers
 */
export class GameValidationHelpers {
  /**
   * Validate player can share word
   */
  static canShareWord(
    player: ConvexPlayer,
    room: ConvexRoom,
    playerId: string,
  ): { canShare: boolean; error?: string } {
    return pureCanShareWord(player, room, playerId);
  }

  /**
   * Validate player can vote
   */
  static canVote(
    voter: ConvexPlayer,
    target: ConvexPlayer,
    room: ConvexRoom,
  ): { canVote: boolean; error?: string } {
    return pureCanVote(voter, target, room);
  }
}

/**
 * Game result helpers
 */
export class GameResultHelpers {
  /**
   * Determine winner from game state
   */
  static determineWinner(alivePlayers: ConvexPlayer[]): {
    winner: string;
    winnerColor: string;
    winnerMessage: string;
  } {
    return pureDetermineWinner(alivePlayers);
  }

  /**
   * Get role display information
   */
  static getRoleDisplay(role: string) {
    return pureGetRoleDisplay(role);
  }
}
