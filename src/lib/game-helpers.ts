import {
  ensureMrWhiteNotFirst,
  findNextAlivePlayer,
  shuffleArray,
} from './utils';
import {
  assignRoles as pureAssignRoles,
  createPlayerOrder as pureCreatePlayerOrder,
  findNextAlivePlayer as pureFindNextAlivePlayer,
} from '../domains/player/role-assignment.service';
import {
  allPlayersCompletedAction as pureAllPlayersCompletedAction,
  determineWinner as pureDetermineWinner,
  getRoleDisplay as pureGetRoleDisplay,
} from '../domains/game/game-logic.service';
import {
  canShareWord as pureCanShareWord,
  canVote as pureCanVote,
} from '../domains/validation/validation.service';

/**
 * Game flow helpers - pure functions for game logic
 */
export class GameFlowHelpers {
  /**
   * Assign roles to players
   */
  static assignRoles(
    players: any[],
    numUndercovers: number,
    hasMrWhite: boolean
  ) {
    return pureAssignRoles(players, numUndercovers, hasMrWhite);
  }

  /**
   * Create player order for word sharing
   */
  static createPlayerOrder(players: any[]) {
    return pureCreatePlayerOrder(players);
  }

  /**
   * Find next player in turn order
   */
  static findNextPlayer(
    playerOrder: string[],
    currentIndex: number,
    alivePlayerIds: string[]
  ) {
    return pureFindNextAlivePlayer(playerOrder, currentIndex, alivePlayerIds);
  }

  /**
   * Check if all alive players have completed action
   */
  static allPlayersCompletedAction(
    players: any[],
    action: 'sharedWord' | 'voted'
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
    player: any,
    room: any,
    playerId: string
  ): { canShare: boolean; error?: string } {
    return pureCanShareWord(player, room, playerId);
  }

  /**
   * Validate player can vote
   */
  static canVote(
    voter: any,
    target: any,
    room: any
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
  static determineWinner(alivePlayers: any[]): {
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
