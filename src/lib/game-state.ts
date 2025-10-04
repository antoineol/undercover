import type { MutationCtx } from "cvx/server";
import type { ConvexRoom, RoomId } from "./convex-types";
import { GameFlowHelpers } from "./game-helpers";
import { GameStateService, PlayerService, RoomService } from "./game-services";

/**
 * Game state management utilities
 */
export class GameStateManager {
  /**
   * Transition game to next phase
   */
  static async transitionToNextPhase(
    ctx: MutationCtx,
    roomId: RoomId,
    currentState: string,
  ) {
    const room = await RoomService.getRoom(ctx, roomId);
    if (!room) return;

    switch (currentState) {
      case "discussion":
        await this.transitionToVoting(ctx, roomId);
        break;
      case "voting":
        await this.processVotingResults(ctx, roomId);
        break;
      default:
        break;
    }
  }

  /**
   * Transition from discussion to voting
   */
  static async transitionToVoting(ctx: MutationCtx, roomId: RoomId) {
    await RoomService.updateGameState(ctx, roomId, {
      gameState: "voting",
    });
  }

  /**
   * Process voting results and determine next state
   */
  static async processVotingResults(ctx: MutationCtx, roomId: RoomId) {
    const room = await RoomService.getRoom(ctx, roomId);
    if (!room) return;

    const alivePlayers = await PlayerService.getAlivePlayers(ctx, roomId);
    if (!alivePlayers) {
      throw new Error("Failed to get alive players");
    }

    const gameResult = GameStateService.checkGameEnd(
      alivePlayers,
      room.currentRound,
      room.maxRounds,
    );

    if (gameResult) {
      // Game ended
      await RoomService.updateGameState(ctx, roomId, {
        gameState: "results",
      });
    } else {
      // Continue to next round
      await this.startNextRound(ctx, roomId, room);
    }
  }

  /**
   * Start next round
   */
  static async startNextRound(
    ctx: MutationCtx,
    roomId: RoomId,
    room: ConvexRoom,
  ) {
    // Reset all players
    await PlayerService.resetAllPlayers(ctx, roomId);

    // Create new player order
    const alivePlayers = await PlayerService.getAlivePlayers(ctx, roomId);
    const alivePlayerIds = alivePlayers.map((p) => p._id);
    const shuffledOrder = [...(room.playerOrder ?? [])].sort(
      () => Math.random() - 0.5,
    );

    // Find first alive player in the shuffled order
    let firstAliveIndex = 0;
    for (let i = 0; i < shuffledOrder.length; i++) {
      const playerId = shuffledOrder[i];
      if (playerId && alivePlayerIds.includes(playerId)) {
        firstAliveIndex = i;
        break;
      }
    }

    await RoomService.updateGameState(ctx, roomId, {
      gameState: "discussion",
      currentRound: room.currentRound + 1,
      currentPlayerIndex: firstAliveIndex,
      playerOrder: shuffledOrder,
    });
  }

  /**
   * Validate and fix game state
   */
  static async validateAndFixGameState(ctx: MutationCtx, roomId: RoomId) {
    const room = await RoomService.getRoom(ctx, roomId);
    if (!room) return { action: "room_not_found" };

    const alivePlayers = await PlayerService.getAlivePlayers(ctx, roomId);
    if (!alivePlayers) {
      throw new Error("Failed to get alive players");
    }

    const gameResult = GameStateService.checkGameEnd(
      alivePlayers,
      room.currentRound,
      room.maxRounds,
    );

    if (gameResult) {
      await RoomService.updateGameState(ctx, roomId, {
        gameState: "results",
      });
      return { action: "game_ended", gameResult };
    }

    // Check if current player is dead and skip to next alive player
    if (
      room.gameState === "discussion" &&
      room.playerOrder &&
      room.currentPlayerIndex !== undefined
    ) {
      const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
      if (!currentPlayerId) {
        throw new Error("Invalid player order or current player index");
      }

      const currentPlayer = await ctx.db.get(currentPlayerId);

      if (currentPlayer && !currentPlayer.isAlive) {
        const alivePlayerIds = alivePlayers.map((p) => p._id);
        const nextAlivePlayerIndex = GameFlowHelpers.findNextPlayer(
          room.playerOrder,
          room.currentPlayerIndex,
          alivePlayerIds,
        );

        if (nextAlivePlayerIndex !== -1) {
          await RoomService.updateGameState(ctx, roomId, {
            currentPlayerIndex: nextAlivePlayerIndex,
          });
          return { action: "skipped_dead_player" };
        }
      }
    }

    // Check if game should move to voting (all alive players have shared words)
    if (room.gameState === "discussion") {
      const allAlivePlayersShared = GameFlowHelpers.allPlayersCompletedAction(
        alivePlayers,
        "sharedWord",
      );
      if (allAlivePlayersShared) {
        await this.transitionToVoting(ctx, roomId);
        return { action: "move_to_voting" };
      }
    }

    // Check if game should move to next round (all alive players have voted)
    if (room.gameState === "voting") {
      const allAlivePlayersVoted = GameFlowHelpers.allPlayersCompletedAction(
        alivePlayers,
        "voted",
      );
      if (allAlivePlayersVoted) {
        await this.processVotingResults(ctx, roomId);
        return { action: "process_voting" };
      }
    }

    return { action: "no_action_needed" };
  }
}
