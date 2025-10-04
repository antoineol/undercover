import { v } from "convex/values";
import {
  GameFlowHelpers,
  GameValidationHelpers,
} from "../src/lib/game-helpers";
import { mutation } from "./_generated/server";

export const shareWord = mutation({
  args: {
    playerId: v.id("players"),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player?.isAlive) {
      throw new Error("Player not found or not alive");
    }

    const room = await ctx.db.get(player.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Validate player can share word
    const validation = GameValidationHelpers.canShareWord(
      player,
      room,
      args.playerId,
    );
    if (!validation.canShare) {
      throw new Error(validation.error);
    }

    // Record the word
    await ctx.db.patch(args.playerId, {
      sharedWord: args.word,
      hasSharedWord: true,
    });

    // Move to next alive player
    const alivePlayers = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) =>
        q.eq("roomId", player.roomId).eq("isAlive", true),
      )
      .collect();

    const alivePlayerIds = alivePlayers.map((p) => p._id);
    const nextAlivePlayerIndex = GameFlowHelpers.findNextPlayer(
      room.playerOrder!,
      room.currentPlayerIndex!,
      alivePlayerIds,
    );

    // Check if all alive players have shared their words
    // We need to refetch players to get the updated hasSharedWord status
    const updatedAlivePlayers = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) =>
        q.eq("roomId", player.roomId).eq("isAlive", true),
      )
      .collect();

    const allAlivePlayersShared = GameFlowHelpers.allPlayersCompletedAction(
      updatedAlivePlayers,
      "sharedWord",
    );

    if (allAlivePlayersShared || nextAlivePlayerIndex === -1) {
      // All players have shared their words, start voting
      await ctx.db.patch(player.roomId, {
        gameState: "voting",
      });
      return { success: true, allShared: true, nextPlayer: null };
    } else {
      // Move to next player
      await ctx.db.patch(player.roomId, {
        currentPlayerIndex: nextAlivePlayerIndex,
      });

      const nextPlayerId = room.playerOrder?.[nextAlivePlayerIndex];
      if (!nextPlayerId) {
        throw new Error("Invalid player order");
      }
      const nextPlayer = await ctx.db.get(nextPlayerId);
      return {
        success: true,
        allShared: false,
        nextPlayer: nextPlayer ? nextPlayer.name : null,
      };
    }
  },
});

export const resetWordSharing = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const player of players) {
      await ctx.db.patch(player._id, {
        hasSharedWord: false,
        sharedWord: undefined,
        votes: [], // Reset votes for new round
      });
    }

    // Reset turn order for next round
    const room = await ctx.db.get(args.roomId);
    if (room?.playerOrder) {
      // Shuffle player order for next round
      const shuffledOrder = [...room.playerOrder].sort(
        () => Math.random() - 0.5,
      );

      await ctx.db.patch(args.roomId, {
        gameState: "discussion",
        currentPlayerIndex: 0,
        playerOrder: shuffledOrder,
      });
    }

    return { success: true };
  },
});
