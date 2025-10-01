import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const WORD_PAIRS = [
  { civilian: "Médecin", undercover: "Infirmière" },
  { civilian: "Pizza", undercover: "Burger" },
  { civilian: "Été", undercover: "Hiver" },
  { civilian: "Café", undercover: "Thé" },
  { civilian: "Chien", undercover: "Chat" },
  { civilian: "Plage", undercover: "Montagne" },
  { civilian: "Livre", undercover: "Film" },
  { civilian: "Voiture", undercover: "Vélo" },
  { civilian: "Pomme", undercover: "Orange" },
  { civilian: "Soleil", undercover: "Lune" },
  { civilian: "École", undercover: "Université" },
  { civilian: "Restaurant", undercover: "Café" },
  { civilian: "Musique", undercover: "Danse" },
  { civilian: "Sport", undercover: "Jeu" },
  { civilian: "Voyage", undercover: "Vacances" },
];

export const startGame = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length < 3) {
      throw new Error("Need at least 3 players to start");
    }

    if (players.length > 10) {
      throw new Error("Too many players");
    }

    // Select random word pair
    const wordPair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];

    // Assign roles
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

    // Determine number of undercovers based on player count
    let undercoverCount = 1;
    if (players.length >= 6) undercoverCount = 2;
    if (players.length >= 9) undercoverCount = 3;

    // Assign roles
    for (let i = 0; i < shuffledPlayers.length; i++) {
      let role: "undercover" | "civilian" | "mr_white" = "civilian";

      if (i < undercoverCount) {
        role = "undercover";
      } else if (i === undercoverCount && players.length >= 7) {
        role = "mr_white";
      }

      await ctx.db.patch(shuffledPlayers[i]._id, { role });
    }

    // Create game words
    await ctx.db.insert("gameWords", {
      roomId: args.roomId,
      civilianWord: wordPair.civilian,
      undercoverWord: wordPair.undercover,
      mrWhiteWord: players.length >= 7 ? "Unknown" : undefined,
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

    // Create player order for word sharing (randomize but ensure Mr. White isn't first in round 1)
    const playerOrder = [...shuffledPlayers];

    // If it's round 1 and we have Mr. White, make sure he's not first
    if (players.length >= 7) {
      const mrWhiteIndex = playerOrder.findIndex(p => p.role === "mr_white");
      if (mrWhiteIndex === 0) {
        // Move Mr. White to a random position (not first)
        const mrWhite = playerOrder.splice(0, 1)[0];
        const randomPosition = Math.floor(Math.random() * (playerOrder.length - 1)) + 1;
        playerOrder.splice(randomPosition, 0, mrWhite);
      }
    }

    // Update room state to word sharing phase
    await ctx.db.patch(args.roomId, {
      gameState: "discussion",
      currentRound: 1,
      currentPlayerIndex: 0,
      playerOrder: playerOrder.map(p => p._id),
    });

    return { success: true };
  },
});

export const shareWord = mutation({
  args: {
    playerId: v.id("players"),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db.get(args.playerId);
    if (!player || !player.isAlive) {
      throw new Error("Player not found or not alive");
    }

    const room = await ctx.db.get(player.roomId);
    if (!room || room.gameState !== "discussion") {
      throw new Error("Game is not in discussion phase");
    }

    // Check if it's this player's turn
    if (!room.playerOrder || room.currentPlayerIndex === undefined) {
      throw new Error("Game not properly initialized");
    }
    const currentPlayerId = room.playerOrder[room.currentPlayerIndex];
    if (currentPlayerId !== args.playerId) {
      throw new Error("It's not your turn to share a word");
    }

    // Check if player has already shared their word
    if (player.hasSharedWord === true) {
      throw new Error("You have already shared your word");
    }

    await ctx.db.patch(args.playerId, {
      sharedWord: args.word,
      hasSharedWord: true,
    });

    // Move to next player
    const alivePlayers = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) => q.eq("roomId", player.roomId).eq("isAlive", true))
      .collect();

    const alivePlayerIds = alivePlayers.map(p => p._id);
    const nextAlivePlayerIndex = room.playerOrder!.findIndex((id, index) =>
      index > room.currentPlayerIndex! && alivePlayerIds.includes(id)
    );

    if (nextAlivePlayerIndex === -1) {
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

      const nextPlayer = await ctx.db.get(room.playerOrder![nextAlivePlayerIndex]);
      return {
        success: true,
        allShared: false,
        nextPlayer: nextPlayer ? nextPlayer.name : null
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
        votes: [],
      });
    }

    // Reset turn order for next round
    const room = await ctx.db.get(args.roomId);
    if (room && room.playerOrder) {
      // Shuffle player order for next round
      const shuffledOrder = [...room.playerOrder].sort(() => Math.random() - 0.5);

      await ctx.db.patch(args.roomId, {
        gameState: "discussion",
        currentPlayerIndex: 0,
        playerOrder: shuffledOrder,
      });
    }

    return { success: true };
  },
});

export const votePlayer = mutation({
  args: {
    roomId: v.id("rooms"),
    voterId: v.id("players"),
    targetId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameState !== "voting") {
      throw new Error("Voting is not active");
    }

    const voter = await ctx.db.get(args.voterId);
    const target = await ctx.db.get(args.targetId);

    if (!voter || !target || !voter.isAlive || !target.isAlive) {
      throw new Error("Invalid vote");
    }

    if (voter.roomId !== args.roomId || target.roomId !== args.roomId) {
      throw new Error("Players not in same room");
    }

    // Update voter's votes (remove previous votes for this round)
    const currentVotes = await Promise.all(
      voter.votes.map(async (voteId) => {
        const votedPlayer = await ctx.db.get(voteId);
        return votedPlayer && votedPlayer.roomId === args.roomId ? voteId : null;
      })
    ).then(results => results.filter((voteId): voteId is Id<"players"> => voteId !== null));

    await ctx.db.patch(args.voterId, {
      votes: [...currentVotes, args.targetId],
    });

    // Check if all alive players have voted
    const allAlivePlayers = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) => q.eq("roomId", args.roomId).eq("isAlive", true))
      .collect();

    const allVoted = allAlivePlayers.every(player => player.votes.length > 0);

    if (allVoted) {
      // Automatically end voting and process results
      // Call endVoting logic directly
      const room = await ctx.db.get(args.roomId);
      if (!room || room.gameState !== "voting") {
        return { success: true, allVoted: false };
      }

      // Count votes
      const voteCounts: Record<string, number> = {};
      for (const player of allAlivePlayers) {
        for (const voteId of player.votes) {
          voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
        }
      }

      // Find player with most votes
      let eliminatedPlayerId: string | null = null;
      let maxVotes = 0;
      let tie = false;

      for (const [playerId, votes] of Object.entries(voteCounts)) {
        if (votes > maxVotes) {
          maxVotes = votes;
          eliminatedPlayerId = playerId;
          tie = false;
        } else if (votes === maxVotes && votes > 0) {
          tie = true;
        }
      }

      // Eliminate player if there's a clear winner
      if (eliminatedPlayerId && !tie) {
        await ctx.db.patch(eliminatedPlayerId as any, { isAlive: false });
      }

      // Check win conditions
      const alivePlayers = allAlivePlayers.filter(p => p.isAlive);
      const aliveUndercovers = alivePlayers.filter(p => p.role === "undercover");
      const aliveCivilians = alivePlayers.filter(p => p.role === "civilian");
      const aliveMrWhite = alivePlayers.filter(p => p.role === "mr_white");

      let gameResult: string | null = null;

      // Check maximum rounds limit
      if (room.currentRound >= room.maxRounds) {
        gameResult = "max_rounds_reached";
      }
      // Civilians win if all undercovers are eliminated
      else if (aliveUndercovers.length === 0) {
        gameResult = "civilians_win";
      }
      // Undercovers win if they equal or outnumber civilians
      else if (aliveUndercovers.length >= aliveCivilians.length) {
        gameResult = "undercovers_win";
      }
      // Mr. White wins if they survive to the end and there are still undercovers
      else if (aliveMrWhite.length > 0 && aliveUndercovers.length > 0 && aliveCivilians.length === 0) {
        gameResult = "mr_white_win";
      }

      // Update room state
      if (gameResult) {
        await ctx.db.patch(args.roomId, {
          gameState: "results",
        });
      } else {
        // Reset word sharing for next round
        const players = await ctx.db
          .query("players")
          .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
          .collect();

        for (const player of players) {
          await ctx.db.patch(player._id, {
            hasSharedWord: false,
            sharedWord: undefined,
            votes: [],
          });
        }

        // Reset turn order for next round
        if (room.playerOrder) {
          const shuffledOrder = [...room.playerOrder].sort(() => Math.random() - 0.5);

          await ctx.db.patch(args.roomId, {
            gameState: "discussion",
            currentRound: room.currentRound + 1,
            currentPlayerIndex: 0,
            playerOrder: shuffledOrder,
          });
        }
      }

      return {
        success: true,
        allVoted: true,
        eliminatedPlayer: eliminatedPlayerId,
        gameResult,
        voteCounts,
      };
    }

    return { success: true, allVoted: false };
  },
});

export const endVoting = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameState !== "voting") {
      throw new Error("Voting is not active");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) => q.eq("roomId", args.roomId).eq("isAlive", true))
      .collect();

    // Count votes
    const voteCounts: Record<string, number> = {};
    for (const player of players) {
      for (const voteId of player.votes) {
        voteCounts[voteId] = (voteCounts[voteId] || 0) + 1;
      }
    }

    // Find player with most votes
    let eliminatedPlayerId: string | null = null;
    let maxVotes = 0;
    let tie = false;

    for (const [playerId, votes] of Object.entries(voteCounts)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        eliminatedPlayerId = playerId;
        tie = false;
      } else if (votes === maxVotes && votes > 0) {
        tie = true;
      }
    }

    // Eliminate player if there's a clear winner
    if (eliminatedPlayerId && !tie) {
      await ctx.db.patch(eliminatedPlayerId as any, { isAlive: false });
    }

    // Check win conditions
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveUndercovers = alivePlayers.filter(p => p.role === "undercover");
    const aliveCivilians = alivePlayers.filter(p => p.role === "civilian");
    const aliveMrWhite = alivePlayers.filter(p => p.role === "mr_white");

    let gameResult: string | null = null;

    // Check maximum rounds limit
    if (room.currentRound >= room.maxRounds) {
      gameResult = "max_rounds_reached";
    }
    // Civilians win if all undercovers are eliminated
    else if (aliveUndercovers.length === 0) {
      gameResult = "civilians_win";
    }
    // Undercovers win if they equal or outnumber civilians
    else if (aliveUndercovers.length >= aliveCivilians.length) {
      gameResult = "undercovers_win";
    }
    // Mr. White wins if they survive to the end and there are still undercovers
    else if (aliveMrWhite.length > 0 && aliveUndercovers.length > 0 && aliveCivilians.length === 0) {
      gameResult = "mr_white_win";
    }

    // Update room state
    if (gameResult) {
      await ctx.db.patch(args.roomId, {
        gameState: "results",
      });
    } else {
      // Reset word sharing for next round
      const players = await ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();

      for (const player of players) {
        await ctx.db.patch(player._id, {
          hasSharedWord: false,
          sharedWord: undefined,
          votes: [],
        });
      }

      await ctx.db.patch(args.roomId, {
        gameState: "discussion",
        currentRound: room.currentRound + 1,
      });
    }

    return {
      eliminatedPlayer: eliminatedPlayerId,
      gameResult,
      voteCounts,
    };
  },
});

export const startVoting = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || room.gameState !== "discussion") {
      throw new Error("Game is not in discussion phase");
    }

    // Clear all votes
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const player of players) {
      await ctx.db.patch(player._id, { votes: [] });
    }

    await ctx.db.patch(args.roomId, {
      gameState: "voting",
    });

    return { success: true };
  },
});

export const getGameWords = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameWords")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();
  },
});

export const checkMaxRoundsReached = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.currentRound >= room.maxRounds) {
      // Determine winner when max rounds are reached
      const players = await ctx.db
        .query("players")
        .withIndex("by_room_alive", (q) => q.eq("roomId", args.roomId).eq("isAlive", true))
        .collect();

      const aliveUndercovers = players.filter(p => p.role === "undercover");
      const aliveCivilians = players.filter(p => p.role === "civilian");
      const aliveMrWhite = players.filter(p => p.role === "mr_white");

      let gameResult: string;
      if (aliveUndercovers.length === 0) {
        gameResult = "civilians_win";
      } else if (aliveUndercovers.length >= aliveCivilians.length) {
        gameResult = "undercovers_win";
      } else if (aliveMrWhite.length > 0 && aliveUndercovers.length > 0) {
        gameResult = "mr_white_win";
      } else {
        gameResult = "civilians_win"; // Default to civilians if unclear
      }

      await ctx.db.patch(args.roomId, {
        gameState: "results",
      });

      return { gameResult, maxRoundsReached: true };
    }

    return { maxRoundsReached: false };
  },
});
