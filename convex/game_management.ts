import { v } from "convex/values";
import { GameNotFinishedError } from "../src/lib/errors";
import { GameFlowHelpers } from "../src/lib/game-helpers";
import {
  GameStateService,
  PlayerService,
  RoomService,
} from "../src/lib/game-services";
import { mutation } from "./_generated/server";

export const validateGameState = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only validate if game is not in waiting or results state
    if (room.gameState === "waiting" || room.gameState === "results") {
      return { gameState: room.gameState, action: "no_action_needed" };
    }

    const players = await PlayerService.getAlivePlayers(ctx, args.roomId);
    if (!players) {
      throw new Error("Failed to get players");
    }

    const gameResult = GameStateService.checkGameEnd(
      players,
      room.currentRound,
      room.maxRounds,
    );

    let action = "no_action_needed";

    if (gameResult) {
      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "results",
      });
      action = "game_ended";
    } else if (room.gameState === "discussion") {
      const allAlivePlayersShared = players.every(
        (p) => p.hasSharedWord === true,
      );
      if (allAlivePlayersShared) {
        await RoomService.updateGameState(ctx, args.roomId, {
          gameState: "voting",
        });
        action = "move_to_voting";
      }
    } else if (room.gameState === "voting") {
      // Voting is handled by the votePlayer mutation, not by validation
      // This validation is only for recovery purposes
      action = "no_action_needed";
    }

    const stats = GameStateService.getGameStats(players);

    return {
      gameState: room.gameState,
      action,
      gameResult,
      alivePlayers: stats.alivePlayers,
      aliveUndercovers: stats.undercovers,
      aliveCivilians: stats.civilians,
      aliveMrWhite: stats.mrWhite,
    };
  },
});

export const restartGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState !== "results") {
      throw new GameNotFinishedError();
    }

    // Reset all players to alive state
    const players = await PlayerService.getAllPlayers(ctx, args.roomId);
    for (const player of players) {
      await ctx.db.patch(player._id, {
        isAlive: true,
        hasSharedWord: false,
        sharedWord: undefined,
        votes: [],
        role: "civilian", // Will be reassigned when game starts
      });
    }

    // Reset room state
    const resetData = RoomService.getResetRoomData();
    await RoomService.updateGameState(ctx, args.roomId, resetData);

    // Remove old game words
    const oldGameWords = await ctx.db
      .query("gameWords")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (oldGameWords) {
      await ctx.db.delete(oldGameWords._id);
    }

    return { success: true };
  },
});

export const stopGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only allow stopping if game is active (not waiting or results)
    if (room.gameState === "waiting" || room.gameState === "results") {
      throw new Error("Game is not currently active");
    }

    // Reset all players to alive state and clear game data
    const players = await PlayerService.getAllPlayers(ctx, args.roomId);
    for (const player of players) {
      await ctx.db.patch(player._id, {
        isAlive: true,
        hasSharedWord: false,
        sharedWord: undefined,
        votes: [],
        role: "civilian", // Will be reassigned when game starts
      });
    }

    // Reset room state to waiting
    const resetData = RoomService.getResetRoomData();
    await RoomService.updateGameState(ctx, args.roomId, resetData);

    // Remove old game words
    const oldGameWords = await ctx.db
      .query("gameWords")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (oldGameWords) {
      await ctx.db.delete(oldGameWords._id);
    }

    return { success: true };
  },
});

export const checkMaxRoundsReached = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.currentRound >= room.maxRounds) {
      // Determine winner when max rounds are reached
      const players = await PlayerService.getAlivePlayers(ctx, args.roomId);
      if (!players) {
        throw new Error("Failed to get players");
      }

      const gameResult = GameStateService.checkGameEnd(
        players,
        room.currentRound,
        room.maxRounds,
      );

      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "results",
      });

      return { gameResult, maxRoundsReached: true };
    }

    return { maxRoundsReached: false };
  },
});

export const fixDataInconsistency = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only fix inconsistencies in discussion phase
    if (room.gameState !== "discussion") {
      return { success: false, reason: "Not in discussion phase" };
    }

    const alivePlayers = await PlayerService.getAlivePlayers(ctx, args.roomId);
    if (!alivePlayers) {
      throw new Error("Failed to get alive players");
    }

    // Check if all players have shared their words
    const allAlivePlayersShared = alivePlayers.every(
      (p) => p.hasSharedWord === true,
    );

    if (allAlivePlayersShared) {
      // All players have shared, move to voting
      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "voting",
      });
      return { success: true, action: "moved_to_voting" };
    }

    // Check if current player has already shared but it's still their turn
    if (room.playerOrder && room.currentPlayerIndex !== undefined) {
      const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
      const currentPlayer = await ctx.db.get(currentPlayerId);

      if (currentPlayer?.hasSharedWord) {
        // Current player has already shared, move to next player
        const alivePlayerIds = alivePlayers.map((p) => p._id);
        const nextAlivePlayerIndex = GameFlowHelpers.findNextPlayer(
          room.playerOrder,
          room.currentPlayerIndex,
          alivePlayerIds,
        );

        if (nextAlivePlayerIndex !== -1) {
          await RoomService.updateGameState(ctx, args.roomId, {
            currentPlayerIndex: nextAlivePlayerIndex,
          });
          return { success: true, action: "moved_to_next_player" };
        }
      }
    }

    return { success: true, action: "no_fix_needed" };
  },
});
