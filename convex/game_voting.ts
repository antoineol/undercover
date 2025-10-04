import { v } from "convex/values";
import {
  type ConvexPlayer,
  type ConvexRoom,
  type RoomId,
} from "../src/lib/convex-types";
import { InvalidVoteError, VotingNotActiveError } from "../src/lib/errors";
import { GameValidationHelpers } from "../src/lib/game-helpers";
import {
  GameStateService,
  PlayerService,
  RoomService,
} from "../src/lib/game-services";
import { mutation, type MutationCtx } from "./_generated/server";

export const votePlayer = mutation({
  args: {
    roomId: v.id("rooms"),
    voterId: v.id("players"),
    targetId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== "voting") {
      throw new VotingNotActiveError();
    }

    const voter = await ctx.db.get(args.voterId);
    const target = await ctx.db.get(args.targetId);

    if (!voter || !target) {
      throw new InvalidVoteError();
    }

    // Validate vote
    const validation = GameValidationHelpers.canVote(voter, target, room);
    if (!validation.canVote) {
      throw new InvalidVoteError();
    }

    // Check if voter is already voting for this target
    const currentVotes = voter.votes || [];
    const isAlreadyVotingForTarget = currentVotes.includes(args.targetId);

    if (isAlreadyVotingForTarget) {
      // Remove the vote (unvote)
      await ctx.db.patch(args.voterId, {
        votes: [],
        hasVoted: true, // Mark that they have participated in voting
      });
    } else {
      // Record the vote
      await ctx.db.patch(args.voterId, {
        votes: [args.targetId],
        hasVoted: true, // Mark that they have participated in voting
      });
    }

    // Check if all alive players have voted
    const allAlivePlayers = await PlayerService.getAlivePlayers(
      ctx,
      args.roomId,
    );

    // Check if all players have made a voting decision
    const allPlayersMadeDecision = allAlivePlayers.every(
      (player: ConvexPlayer) => player.hasVoted === true,
    );

    if (allPlayersMadeDecision) {
      // Process voting results
      return await processVotingResults(
        ctx,
        args.roomId,
        allAlivePlayers,
        room,
      );
    }

    return { success: true, allVoted: false };
  },
});

export const endVoting = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== "voting") {
      throw new VotingNotActiveError();
    }

    const alivePlayers = await PlayerService.getAlivePlayers(ctx, args.roomId);
    return await processVotingResults(ctx, args.roomId, alivePlayers, room);
  },
});

export const startVoting = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== "discussion") {
      throw new Error("Game is not in discussion phase");
    }

    // Clear all votes and reset voting status
    const players = await PlayerService.getAllPlayers(ctx, args.roomId);
    for (const player of players) {
      await ctx.db.patch(player._id, {
        votes: [],
        hasVoted: false,
      });
    }

    await RoomService.updateGameState(ctx, args.roomId, {
      gameState: "voting",
    });

    return { success: true };
  },
});

export const mrWhiteGuess = mutation({
  args: {
    roomId: v.id("rooms"),
    guess: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== "mr_white_guessing") {
      throw new Error("Game is not in Mr. White guessing phase");
    }

    // Get the game words
    const gameWords = await ctx.db
      .query("gameWords")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!gameWords) {
      throw new Error("Game words not found");
    }

    // Check if the guess is correct (case-insensitive)
    const isCorrect =
      args.guess.toLowerCase().trim() ===
      gameWords.civilianWord.toLowerCase().trim();

    if (isCorrect) {
      // Mr. White wins immediately
      await RoomService.updateGameState(ctx, args.roomId, {
        gameState: "results",
      });

      return {
        success: true,
        correct: true,
        gameResult: "mr_white_win",
        civilianWord: gameWords.civilianWord,
      };
    } else {
      // Mr. White is eliminated, continue with normal game flow
      const alivePlayers = await PlayerService.getAlivePlayers(
        ctx,
        args.roomId,
      );
      if (!alivePlayers) {
        throw new Error("Failed to get alive players");
      }

      const gameResult = GameStateService.checkGameEnd(
        alivePlayers,
        room.currentRound,
        room.maxRounds,
      );

      if (gameResult) {
        await RoomService.updateGameState(ctx, args.roomId, {
          gameState: "results",
        });
      } else {
        // Reset for next round
        await resetForNextRound(ctx, args.roomId, room);
      }

      return {
        success: true,
        correct: false,
        gameResult,
        civilianWord: gameWords.civilianWord,
      };
    }
  },
});

// Helper function to process voting results
export async function processVotingResults(
  ctx: MutationCtx,
  roomId: RoomId,
  alivePlayers: ConvexPlayer[],
  room: ConvexRoom,
) {
  // Process voting results
  const { eliminatedPlayerId, voteCounts, tie } =
    GameStateService.processVotingResults(alivePlayers);

  // Eliminate player if there's a clear winner
  if (eliminatedPlayerId && !tie) {
    const eliminatedPlayer = await ctx.db.get(eliminatedPlayerId);

    // Check if eliminated player is Mr. White
    if (
      eliminatedPlayer &&
      "role" in eliminatedPlayer &&
      eliminatedPlayer.role === "mr_white"
    ) {
      // Mr. White gets a chance to guess the civilian word
      await RoomService.updateGameState(ctx, roomId, {
        gameState: "mr_white_guessing",
      });

      return {
        success: true,
        allVoted: true,
        eliminatedPlayer: eliminatedPlayerId,
        gameResult: null,
        voteCounts,
        mrWhiteGuessing: true,
      };
    } else {
      // Regular elimination
      await ctx.db.patch(eliminatedPlayerId, { isAlive: false });
    }
  }

  // Check win conditions - refetch alive players after elimination
  const remainingPlayers = await PlayerService.getAlivePlayers(ctx, roomId);
  const gameResult = GameStateService.checkGameEnd(
    remainingPlayers,
    room.currentRound,
    room.maxRounds,
  );

  // Update room state
  if (gameResult) {
    // Game ended
    await RoomService.updateGameState(ctx, roomId, {
      gameState: "results",
    });
  } else if (eliminatedPlayerId && !tie) {
    // Someone was eliminated AND game continues: Start next round
    await resetForNextRound(ctx, roomId, room);
  } else {
    // No one eliminated (tie or no votes) AND game continues: Stay in discussion, preserve word sharing
    await resetVotingData(ctx, roomId);
  }

  return {
    success: true,
    allVoted: true,
    eliminatedPlayer: eliminatedPlayerId,
    gameResult,
    voteCounts,
  };
}

// Helper function to reset voting data and word sharing status for continued discussion
async function resetVotingData(ctx: MutationCtx, roomId: RoomId) {
  // Reset voting data AND word sharing data so players can share words again
  const players = await PlayerService.getAllPlayers(ctx, roomId);
  for (const player of players) {
    await ctx.db.patch(player._id, {
      votes: [],
      hasVoted: false,
      hasSharedWord: false,
      sharedWord: undefined,
    });
  }

  // Stay in discussion phase for the same round
  await RoomService.updateGameState(ctx, roomId, {
    gameState: "discussion",
  });
}

// Helper function to reset game for next round
async function resetForNextRound(
  ctx: MutationCtx,
  roomId: RoomId,
  room: ConvexRoom,
) {
  // Reset all players' word sharing status and votes
  await PlayerService.resetAllPlayers(ctx, roomId);

  // Reset turn order for next round
  if (room.playerOrder) {
    const alivePlayers = await PlayerService.getAlivePlayers(ctx, roomId);
    const alivePlayerIds = alivePlayers.map((p: ConvexPlayer) => p._id);
    const shuffledOrder = [...room.playerOrder].sort(() => Math.random() - 0.5);

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
}
