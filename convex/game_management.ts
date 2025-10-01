import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { GameStateService, PlayerService, RoomService } from "../src/lib/game-services";
import { GameResultHelpers } from "../src/lib/game-helpers";
import { GameNotFinishedError } from "../src/lib/errors";

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
    const gameResult = GameStateService.checkGameEnd(players, room.currentRound, room.maxRounds);

    let action = "no_action_needed";

    if (gameResult) {
      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "results",
      });
      action = "game_ended";
    } else if (room.gameState === "discussion") {
      const allAlivePlayersShared = players.every((p: any) => p.hasSharedWord === true);
      if (allAlivePlayersShared) {
        await RoomService.updateGameState(ctx, args.roomId, {
          gameState: "voting",
        });
        action = "move_to_voting";
      }
    } else if (room.gameState === "voting") {
      const allAlivePlayersVoted = players.every((p: any) => p.votes.length > 0);
      if (allAlivePlayersVoted) {
        action = "process_voting";
      }
    }

    const stats = GameStateService.getGameStats(players);

    return {
      gameState: room.gameState,
      action,
      gameResult,
      alivePlayers: stats.alivePlayers,
      aliveUndercovers: stats.undercovers,
      aliveCivilians: stats.civilians,
      aliveMrWhite: stats.mrWhite
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
      const gameResult = GameStateService.checkGameEnd(players, room.currentRound, room.maxRounds);

      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "results",
      });

      return { gameResult, maxRoundsReached: true };
    }

    return { maxRoundsReached: false };
  },
});
