import { v } from "convex/values";
import {
  InsufficientPlayersError,
  TooManyPlayersError,
} from "../src/lib/errors";
import { GameFlowHelpers } from "../src/lib/game-helpers";
import { GameConfigService } from "../src/lib/game-services";
import { getRandomWordPair } from "../src/lib/word-pairs";
// Removed unused imports - types are now properly handled
import { mutation } from "./_generated/server";

export const startGame = mutation({
  args: {
    roomId: v.id("rooms"),
    numUndercovers: v.number(),
    numMrWhites: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Validate player count
    if (players.length < 3) {
      throw new InsufficientPlayersError(3, players.length);
    }

    if (players.length > 10) {
      throw new TooManyPlayersError(10, players.length);
    }

    // Validate game configuration
    GameConfigService.validateConfig(
      players.length,
      args.numUndercovers,
      args.numMrWhites,
    );

    // Select random word pair
    const wordPair = getRandomWordPair();

    // Assign roles
    const roleAssignments = GameFlowHelpers.assignRoles(
      players,
      args.numUndercovers,
      args.numMrWhites,
    );

    for (const assignment of roleAssignments) {
      await ctx.db.patch(assignment.playerId, { role: assignment.role });
    }

    // Create game words
    if (!wordPair) {
      throw new Error("Failed to get word pair");
    }

    await ctx.db.insert("gameWords", {
      roomId: args.roomId,
      civilianWord: wordPair.civilian,
      undercoverWord: wordPair.undercover,
      mrWhiteWord: args.numMrWhites > 0 ? "Unknown" : undefined,
      createdAt: Date.now(),
    });

    // Reset all players' word sharing status
    for (const player of players) {
      await ctx.db.patch(player._id, {
        hasSharedWord: false,
        sharedWord: undefined,
        votes: [],
      });
    }

    // Create player order for word sharing
    const playerOrder = GameFlowHelpers.createPlayerOrder(players);

    // Update room state to word sharing phase
    await ctx.db.patch(args.roomId, {
      gameState: "discussion",
      currentRound: 1,
      currentPlayerIndex: 0,
      playerOrder: playerOrder,
      numMrWhites: args.numMrWhites,
      numUndercovers: args.numUndercovers,
    });

    return { success: true };
  },
});
