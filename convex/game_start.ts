import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getRandomWordPair } from "../src/lib/word-pairs";
import { GameConfigService } from "../src/lib/game-services";
import { GameFlowHelpers } from "../src/lib/game-helpers";
import { InsufficientPlayersError, TooManyPlayersError, InvalidGameConfigurationError } from "../src/lib/errors";

export const startGame = mutation({
  args: {
    roomId: v.id("rooms"),
    numUndercovers: v.number(),
    hasMrWhite: v.boolean()
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
    GameConfigService.validateConfig(players.length, args.numUndercovers, args.hasMrWhite);

    // Select random word pair
    const wordPair = getRandomWordPair();

    // Assign roles
    const roleAssignments = GameFlowHelpers.assignRoles(players, args.numUndercovers, args.hasMrWhite);

    for (const assignment of roleAssignments) {
      await ctx.db.patch(assignment.playerId, { role: assignment.role });
    }

    // Create game words
    await ctx.db.insert("gameWords", {
      roomId: args.roomId,
      civilianWord: wordPair.civilian,
      undercoverWord: wordPair.undercover,
      mrWhiteWord: args.hasMrWhite ? "Unknown" : undefined,
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
    const playerOrder = GameFlowHelpers.createPlayerOrder(players, args.hasMrWhite);

    // Update room state to word sharing phase
    await ctx.db.patch(args.roomId, {
      gameState: "discussion",
      currentRound: 1,
      currentPlayerIndex: 0,
      playerOrder,
      hasMrWhite: args.hasMrWhite,
      numUndercovers: args.numUndercovers,
    });

    return { success: true };
  },
});
