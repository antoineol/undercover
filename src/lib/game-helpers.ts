import { shuffleArray, ensureMrWhiteNotFirst, findNextAlivePlayer } from './utils';
import { PlayerService } from './game-services';

/**
 * Game flow helpers - pure functions for game logic
 */
export class GameFlowHelpers {
  /**
   * Assign roles to players
   */
  static assignRoles(players: any[], numUndercovers: number, hasMrWhite: boolean) {
    const shuffledPlayers = shuffleArray(players);
    const roleAssignments = [];

    for (let i = 0; i < shuffledPlayers.length; i++) {
      let role: "undercover" | "civilian" | "mr_white" = "civilian";

      if (i < numUndercovers) {
        role = "undercover";
      } else if (i === numUndercovers && hasMrWhite) {
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
  static createPlayerOrder(players: any[], hasMrWhite: boolean) {
    const playerOrder = ensureMrWhiteNotFirst([...players]);
    return playerOrder.map(p => p._id);
  }

  /**
   * Find next player in turn order
   */
  static findNextPlayer(playerOrder: string[], currentIndex: number, alivePlayerIds: string[]) {
    return findNextAlivePlayer(playerOrder, currentIndex, alivePlayerIds);
  }

  /**
   * Check if all alive players have completed action
   */
  static allPlayersCompletedAction(players: any[], action: 'sharedWord' | 'voted'): boolean {
    return players.every(p => {
      if (action === 'sharedWord') {
        return p.hasSharedWord === true;
      } else if (action === 'voted') {
        return p.votes.length > 0;
      }
      return false;
    });
  }
}

/**
 * Game validation helpers
 */
export class GameValidationHelpers {
  /**
   * Validate player can share word
   */
  static canShareWord(player: any, room: any, playerId: string): { canShare: boolean; error?: string } {
    if (!player || !player.isAlive) {
      return { canShare: false, error: "Player not found or not alive" };
    }

    if (room.gameState !== "discussion") {
      return { canShare: false, error: "Game is not in discussion phase" };
    }

    if (!room.playerOrder || room.currentPlayerIndex === undefined) {
      return { canShare: false, error: "Game not properly initialized" };
    }

    const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
    if (currentPlayerId !== playerId) {
      return { canShare: false, error: "It's not your turn to share a word" };
    }

    if (player.hasSharedWord === true) {
      return { canShare: false, error: "You have already shared your word" };
    }

    return { canShare: true };
  }

  /**
   * Validate player can vote
   */
  static canVote(voter: any, target: any, room: any): { canVote: boolean; error?: string } {
    if (!voter || !target || !voter.isAlive || !target.isAlive) {
      return { canVote: false, error: "Invalid vote" };
    }

    if (room.gameState !== "voting") {
      return { canVote: false, error: "Voting is not active" };
    }

    if (voter.roomId !== target.roomId) {
      return { canVote: false, error: "Players not in same room" };
    }

    return { canVote: true };
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
    const aliveUndercovers = alivePlayers.filter(p => p.role === "undercover");
    const aliveCivilians = alivePlayers.filter(p => p.role === "civilian");
    const aliveMrWhite = alivePlayers.filter(p => p.role === "mr_white");

    if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
      return {
        winner: "Les civils",
        winnerColor: "text-blue-600",
        winnerMessage: "Les civils ont éliminé tous les Undercovers et Mr. White !"
      };
    }

    if (aliveUndercovers.length >= aliveCivilians.length && aliveMrWhite.length === 0) {
      return {
        winner: "Les undercovers",
        winnerColor: "text-red-600",
        winnerMessage: "Les Undercovers ont survécu et surpassé les civils !"
      };
    }

    if (aliveMrWhite.length > 0 && aliveCivilians.length > 0 && aliveUndercovers.length === 0 && alivePlayers.length === 2) {
      return {
        winner: "Mr. White",
        winnerColor: "text-gray-600",
        winnerMessage: "Mr. White a survécu jusqu'à la fin !"
      };
    }

    if (aliveCivilians.length === 0 && aliveUndercovers.length > 0 && aliveMrWhite.length > 0) {
      return {
        winner: "Les undercovers & Mr. White",
        winnerColor: "text-purple-600",
        winnerMessage: "Les Undercovers et Mr. White ont éliminé tous les civils !"
      };
    }

    return {
      winner: "Personne",
      winnerColor: "text-gray-600",
      winnerMessage: "Le jeu s'est terminé sans vainqueur clair. Veuillez recommencer."
    };
  }

  /**
   * Get role display information
   */
  static getRoleDisplay(role: string) {
    const roleMap = {
      undercover: { name: 'Undercover', color: 'bg-red-100 text-red-800' },
      mr_white: { name: 'Mr. White', color: 'bg-gray-100 text-gray-800' },
      civilian: { name: 'Civil', color: 'bg-blue-100 text-blue-800' },
    };

    return roleMap[role as keyof typeof roleMap] || { name: role, color: 'bg-gray-100 text-gray-800' };
  }
}
