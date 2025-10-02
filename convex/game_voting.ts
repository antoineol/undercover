import { v } from 'convex/values';
import { InvalidVoteError, VotingNotActiveError } from '../src/lib/errors';
import { GameValidationHelpers } from '../src/lib/game-helpers';
import {
  GameStateService,
  PlayerService,
  RoomService,
} from '../src/lib/game-services';
import { mutation } from './_generated/server';

export const votePlayer = mutation({
  args: {
    roomId: v.id('rooms'),
    voterId: v.id('players'),
    targetId: v.id('players'),
  },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== 'voting') {
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
      args.roomId
    );

    // Check if all players have made a voting decision
    const allPlayersMadeDecision = allAlivePlayers.every(
      (player: any) => player.hasVoted === true
    );

    if (allPlayersMadeDecision) {
      // Process voting results
      return await processVotingResults(
        ctx,
        args.roomId,
        allAlivePlayers,
        room
      );
    }

    return { success: true, allVoted: false };
  },
});

export const endVoting = mutation({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== 'voting') {
      throw new VotingNotActiveError();
    }

    const alivePlayers = await PlayerService.getAlivePlayers(ctx, args.roomId);
    return await processVotingResults(ctx, args.roomId, alivePlayers, room);
  },
});

export const startVoting = mutation({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await RoomService.getRoom(ctx, args.roomId);
    if (!room || room.gameState !== 'discussion') {
      throw new Error('Game is not in discussion phase');
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
      gameState: 'voting',
    });

    return { success: true };
  },
});

// Helper function to process voting results
export async function processVotingResults(
  ctx: any,
  roomId: string,
  alivePlayers: any[],
  room: any
) {
  // Process voting results
  const { eliminatedPlayerId, voteCounts, tie } =
    GameStateService.processVotingResults(alivePlayers);

  // Eliminate player if there's a clear winner
  if (eliminatedPlayerId && !tie) {
    await ctx.db.patch(eliminatedPlayerId as any, { isAlive: false });
  }

  // Check win conditions - refetch alive players after elimination
  const remainingPlayers = await PlayerService.getAlivePlayers(ctx, roomId);
  const gameResult = GameStateService.checkGameEnd(
    remainingPlayers,
    room.currentRound,
    room.maxRounds
  );

  // Update room state
  if (gameResult) {
    await RoomService.updateGameState(ctx, roomId, {
      gameState: 'results',
    });
  } else {
    // Reset for next round
    await resetForNextRound(ctx, roomId, room);
  }

  return {
    success: true,
    allVoted: true,
    eliminatedPlayer: eliminatedPlayerId,
    gameResult,
    voteCounts,
  };
}

// Helper function to reset game for next round
async function resetForNextRound(ctx: any, roomId: string, room: any) {
  // Reset all players' word sharing status and votes
  await PlayerService.resetAllPlayers(ctx, roomId);

  // Reset turn order for next round
  if (room.playerOrder) {
    const alivePlayers = await PlayerService.getAlivePlayers(ctx, roomId);
    const alivePlayerIds = alivePlayers.map((p: any) => p._id);
    const shuffledOrder = [...room.playerOrder].sort(() => Math.random() - 0.5);

    // Find first alive player in the shuffled order
    let firstAliveIndex = 0;
    for (let i = 0; i < shuffledOrder.length; i++) {
      if (alivePlayerIds.includes(shuffledOrder[i])) {
        firstAliveIndex = i;
        break;
      }
    }

    await RoomService.updateGameState(ctx, roomId, {
      gameState: 'discussion',
      currentRound: room.currentRound + 1,
      currentPlayerIndex: firstAliveIndex,
      playerOrder: shuffledOrder,
    });
  }
}
