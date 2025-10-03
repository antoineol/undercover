import { GAME_CONFIG } from './constants';
import {
  calculatePlayerCounts,
  checkWinConditions,
  countVotes,
  findEliminatedPlayer,
} from './utils';
import {
  calculatePlayerCounts as pureCalculatePlayerCounts,
  checkWinConditions as pureCheckWinConditions,
  countVotes as pureCountVotes,
  findEliminatedPlayer as pureFindEliminatedPlayer,
} from '../domains/game/game-logic.service';

/**
 * Game state management service
 */
export class GameStateService {
  /**
   * Check if game should end based on win conditions
   */
  static checkGameEnd(
    players: any[],
    currentRound: number,
    maxRounds: number
  ): string | null {
    const counts = pureCalculatePlayerCounts(players);
    let gameResult = pureCheckWinConditions(counts);

    // Check maximum rounds limit
    if (currentRound >= maxRounds) {
      gameResult = 'max_rounds_reached';
    }

    return gameResult;
  }

  /**
   * Process voting results and determine elimination
   */
  static processVotingResults(alivePlayers: any[]): {
    eliminatedPlayerId: string | null;
    voteCounts: Record<string, number>;
    tie: boolean;
  } {
    const voteCounts = pureCountVotes(alivePlayers);
    const { eliminatedPlayerId, tie } = pureFindEliminatedPlayer(voteCounts);

    return {
      eliminatedPlayerId,
      voteCounts,
      tie,
    };
  }

  /**
   * Get game statistics
   */
  static getGameStats(players: any[]) {
    const counts = pureCalculatePlayerCounts(players);
    return {
      totalPlayers: players.length,
      alivePlayers: counts.alive,
      undercovers: counts.undercovers,
      civilians: counts.civilians,
      mrWhite: counts.mrWhite,
    };
  }
}

/**
 * Player management service
 */
export class PlayerService {
  /**
   * Reset all players for new round
   */
  static getResetPlayerData() {
    return {
      hasSharedWord: false,
      sharedWord: undefined,
      votes: [],
      hasVoted: false,
    };
  }

  /**
   * Get alive players from room
   */
  static async getAlivePlayers(ctx: any, roomId: string) {
    return await ctx.db
      .query('players')
      .withIndex('by_room_alive', (q: any) =>
        q.eq('roomId', roomId).eq('isAlive', true)
      )
      .collect();
  }

  /**
   * Get all players from room
   */
  static async getAllPlayers(ctx: any, roomId: string) {
    return await ctx.db
      .query('players')
      .withIndex('by_room', (q: any) => q.eq('roomId', roomId))
      .collect();
  }

  /**
   * Reset all players in room
   */
  static async resetAllPlayers(ctx: any, roomId: string) {
    const players = await this.getAllPlayers(ctx, roomId);
    const resetData = this.getResetPlayerData();

    for (const player of players) {
      await ctx.db.patch(player._id, resetData);
    }
  }
}

/**
 * Room management service
 */
export class RoomService {
  /**
   * Update room game state
   */
  static async updateGameState(ctx: any, roomId: string, updates: any) {
    return await ctx.db.patch(roomId, updates);
  }

  /**
   * Get room by ID
   */
  static async getRoom(ctx: any, roomId: string) {
    return await ctx.db.get(roomId);
  }

  /**
   * Reset room for new game
   */
  static getResetRoomData() {
    return {
      gameState: 'waiting',
      currentRound: 0,
      currentPlayerIndex: 0,
      playerOrder: [],
    };
  }
}

/**
 * Game configuration service
 */
export class GameConfigService {
  /**
   * Validate game configuration
   */
  static validateConfig(
    playerCount: number,
    numUndercovers: number,
    hasMrWhite: boolean
  ) {
    if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
      throw new Error(
        `Need at least ${GAME_CONFIG.MIN_PLAYERS} players to start`
      );
    }

    if (playerCount > GAME_CONFIG.MAX_PLAYERS) {
      throw new Error(
        `Too many players. Maximum is ${GAME_CONFIG.MAX_PLAYERS}`
      );
    }

    if (numUndercovers < GAME_CONFIG.MIN_UNDERCOVERS) {
      throw new Error(
        `Need at least ${GAME_CONFIG.MIN_UNDERCOVERS} undercover`
      );
    }

    const maxUndercovers = Math.floor(
      playerCount * GAME_CONFIG.MAX_UNDERCOVERS_RATIO
    );
    if (numUndercovers > maxUndercovers) {
      throw new Error(`Too many undercovers. Maximum is ${maxUndercovers}`);
    }

    const totalSpecialRoles = numUndercovers + (hasMrWhite ? 1 : 0);
    if (totalSpecialRoles >= playerCount) {
      throw new Error(
        'Need at least 1 civilian player. Reduce undercovers or disable Mr. White.'
      );
    }

    if (hasMrWhite && playerCount < GAME_CONFIG.MR_WHITE_MIN_PLAYERS) {
      throw new Error(
        `Mr. White requires at least ${GAME_CONFIG.MR_WHITE_MIN_PLAYERS} players`
      );
    }
  }

  /**
   * Get default game configuration
   */
  static getDefaultConfig() {
    return {
      numUndercovers: 1,
      hasMrWhite: false,
      maxRounds: GAME_CONFIG.MAX_ROUNDS,
    };
  }
}
