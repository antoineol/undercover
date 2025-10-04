import { type Id } from "../../convex/_generated/dataModel";
import { type MutationCtx } from "../../convex/_generated/server";
import {
  calculatePlayerCounts as pureCalculatePlayerCounts,
  checkWinConditions as pureCheckWinConditions,
  countVotes as pureCountVotes,
  findEliminatedPlayer as pureFindEliminatedPlayer,
} from "../domains/game/game-logic.service";
import { GAME_CONFIG } from "./constants";
import {
  type ConvexPlayer,
  type ConvexRoom,
  type RoomId,
} from "./convex-types";

/**
 * Game state management service
 */
export class GameStateService {
  /**
   * Check if game should end based on win conditions
   */
  static checkGameEnd(
    players: ConvexPlayer[],
    currentRound: number,
    maxRounds: number,
  ): string | null {
    const counts = pureCalculatePlayerCounts(players);
    let gameResult = pureCheckWinConditions(counts);

    // Check maximum rounds limit
    if (currentRound >= maxRounds) {
      gameResult = "max_rounds_reached";
    }

    return gameResult;
  }

  /**
   * Process voting results and determine elimination
   */
  static processVotingResults(alivePlayers: ConvexPlayer[]): {
    eliminatedPlayerId: Id<"players"> | null;
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
  static getGameStats(players: ConvexPlayer[]) {
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
  static async getAlivePlayers(
    ctx: MutationCtx,
    roomId: RoomId,
  ): Promise<ConvexPlayer[]> {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) =>
        q.eq("roomId", roomId).eq("isAlive", true),
      )
      .collect();

    if (!players) {
      throw new Error("Failed to get alive players");
    }

    return players;
  }

  /**
   * Get all players from room
   */
  static async getAllPlayers(
    ctx: MutationCtx,
    roomId: RoomId,
  ): Promise<ConvexPlayer[]> {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();

    if (!players) {
      throw new Error("Failed to get all players");
    }

    return players;
  }

  /**
   * Reset all players in room
   */
  static async resetAllPlayers(ctx: MutationCtx, roomId: RoomId) {
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
  static async updateGameState(
    ctx: MutationCtx,
    roomId: RoomId,
    updates: Record<string, unknown>,
  ) {
    return await ctx.db.patch(roomId, updates);
  }

  /**
   * Get room by ID
   */
  static async getRoom(ctx: MutationCtx, roomId: RoomId): Promise<ConvexRoom> {
    const room = await ctx.db.get(roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    return room;
  }

  /**
   * Reset room for new game
   */
  static getResetRoomData() {
    return {
      gameState: "waiting",
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
    numMrWhites: number,
  ) {
    if (playerCount < GAME_CONFIG.MIN_PLAYERS) {
      throw new Error(
        `Need at least ${GAME_CONFIG.MIN_PLAYERS} players to start`,
      );
    }

    if (playerCount > GAME_CONFIG.MAX_PLAYERS) {
      throw new Error(
        `Too many players. Maximum is ${GAME_CONFIG.MAX_PLAYERS}`,
      );
    }

    if (numUndercovers < GAME_CONFIG.MIN_UNDERCOVERS) {
      throw new Error(
        `Need at least ${GAME_CONFIG.MIN_UNDERCOVERS} undercover`,
      );
    }

    const maxUndercovers = Math.floor(
      playerCount * GAME_CONFIG.MAX_UNDERCOVERS_RATIO,
    );
    if (numUndercovers > maxUndercovers) {
      throw new Error(`Too many undercovers. Maximum is ${maxUndercovers}`);
    }

    const totalSpecialRoles = numUndercovers + numMrWhites;
    if (totalSpecialRoles >= playerCount) {
      throw new Error(
        "Need at least 1 civilian player. Reduce undercovers or Mr. Whites.",
      );
    }

    if (numMrWhites > 0 && playerCount < GAME_CONFIG.MR_WHITE_MIN_PLAYERS) {
      throw new Error(
        `Mr. White requires at least ${GAME_CONFIG.MR_WHITE_MIN_PLAYERS} players`,
      );
    }
  }

  /**
   * Get default game configuration
   */
  static getDefaultConfig() {
    return {
      numUndercovers: 1,
      numMrWhites: 0,
      maxRounds: GAME_CONFIG.MAX_ROUNDS,
    };
  }
}
