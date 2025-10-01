import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    // Move to next alive player
    const alivePlayers = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) => q.eq("roomId", player.roomId).eq("isAlive", true))
      .collect();

    const alivePlayerIds = alivePlayers.map(p => p._id);

    // Find next alive player in the order
    let nextAlivePlayerIndex = -1;
    for (let i = room.currentPlayerIndex! + 1; i < room.playerOrder!.length; i++) {
      if (alivePlayerIds.includes(room.playerOrder![i])) {
        nextAlivePlayerIndex = i;
        break;
      }
    }

    // If no next alive player found, check from the beginning
    if (nextAlivePlayerIndex === -1) {
      for (let i = 0; i < room.currentPlayerIndex!; i++) {
        if (alivePlayerIds.includes(room.playerOrder![i])) {
          nextAlivePlayerIndex = i;
          break;
        }
      }
    }

    // Check if all alive players have shared their words
    const allAlivePlayersShared = alivePlayers.every(p => p.hasSharedWord === true);

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
        votes: [], // Reset votes for new round
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

    // Check if voter has already voted in this round
    const hasVoted = voter.votes.length > 0;

    if (hasVoted) {
      // Remove previous vote and add new vote (single vote per round)
      await ctx.db.patch(args.voterId, {
        votes: [args.targetId],
      });
    } else {
      // Add first vote
      await ctx.db.patch(args.voterId, {
        votes: [args.targetId],
      });
    }

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
      // Civilians win if all undercovers AND all Mr. White are eliminated
      else if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
        gameResult = "civilians_win";
      }
      // Undercovers win if they equal or outnumber civilians (and no Mr. White)
      else if (aliveUndercovers.length >= aliveCivilians.length && aliveMrWhite.length === 0) {
        gameResult = "undercovers_win";
      }
      // Mr. White solo victory: survives to end (last 2 players) with at least one civilian
      else if (aliveMrWhite.length > 0 && aliveCivilians.length > 0 && aliveUndercovers.length === 0 && alivePlayers.length === 2) {
        gameResult = "mr_white_win";
      }
      // Joint victory: Undercovers + Mr. White win if all civilians eliminated
      else if (aliveCivilians.length === 0 && aliveUndercovers.length > 0 && aliveMrWhite.length > 0) {
        gameResult = "undercovers_mrwhite_win";
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
    // Civilians win if all undercovers AND all Mr. White are eliminated
    else if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
      gameResult = "civilians_win";
    }
    // Undercovers win if they equal or outnumber civilians (and no Mr. White)
    else if (aliveUndercovers.length >= aliveCivilians.length && aliveMrWhite.length === 0) {
      gameResult = "undercovers_win";
    }
    // Mr. White solo victory: survives to end (last 2 players) with at least one civilian
    else if (aliveMrWhite.length > 0 && aliveCivilians.length > 0 && aliveUndercovers.length === 0 && alivePlayers.length === 2) {
      gameResult = "mr_white_win";
    }
    // Joint victory: Undercovers + Mr. White win if all civilians eliminated
    else if (aliveCivilians.length === 0 && aliveUndercovers.length > 0 && aliveMrWhite.length > 0) {
      gameResult = "undercovers_mrwhite_win";
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

export const validateGameState = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Only validate if game is not in waiting or results state
    if (room.gameState === "waiting" || room.gameState === "results") {
      return { gameState: room.gameState, action: "no_action_needed" };
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room_alive", (q) => q.eq("roomId", args.roomId).eq("isAlive", true))
      .collect();

    const aliveUndercovers = players.filter(p => p.role === "undercover");
    const aliveCivilians = players.filter(p => p.role === "civilian");
    const aliveMrWhite = players.filter(p => p.role === "mr_white");

    // Check win conditions
    let gameResult: string | null = null;
    let action = "no_action_needed";

    // Civilians win if all undercovers AND all Mr. White are eliminated
    if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
      gameResult = "civilians_win";
      action = "game_ended";
    }
    // Undercovers win if they equal or outnumber civilians (and no Mr. White)
    else if (aliveUndercovers.length >= aliveCivilians.length && aliveMrWhite.length === 0) {
      gameResult = "undercovers_win";
      action = "game_ended";
    }
    // Mr. White solo victory: survives to end with at least one civilian, no undercovers
    else if (aliveMrWhite.length > 0 && aliveCivilians.length > 0 && aliveUndercovers.length === 0) {
      gameResult = "mr_white_win";
      action = "game_ended";
    }
    // Joint victory: Undercovers + Mr. White win if all civilians eliminated
    else if (aliveCivilians.length === 0 && aliveUndercovers.length > 0 && aliveMrWhite.length > 0) {
      gameResult = "undercovers_mrwhite_win";
      action = "game_ended";
    }
    // Check if game should move to voting (all alive players have shared words)
    else if (room.gameState === "discussion") {
      const allAlivePlayersShared = players.every(p => p.hasSharedWord === true);
      if (allAlivePlayersShared) {
        action = "move_to_voting";
      }
    }
    // Check if game should move to next round (all alive players have voted)
    else if (room.gameState === "voting") {
      const allAlivePlayersVoted = players.every(p => p.votes.length > 0);
      if (allAlivePlayersVoted) {
        action = "process_voting";
      }
    }

    // Execute the required action
    if (action === "game_ended") {
      await ctx.db.patch(args.roomId, {
        gameState: "results",
      });
    } else if (action === "move_to_voting") {
      await ctx.db.patch(args.roomId, {
        gameState: "voting",
      });
    } else if (action === "process_voting") {
      // Process voting results
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

      // Check win conditions after elimination
      const remainingPlayers = players.filter(p => p.isAlive);
      const remainingUndercovers = remainingPlayers.filter(p => p.role === "undercover");
      const remainingCivilians = remainingPlayers.filter(p => p.role === "civilian");
      const remainingMrWhite = remainingPlayers.filter(p => p.role === "mr_white");

      let finalGameResult: string | null = null;
      if (remainingUndercovers.length === 0 && remainingMrWhite.length === 0) {
        finalGameResult = "civilians_win";
      } else if (remainingUndercovers.length >= remainingCivilians.length && remainingMrWhite.length === 0) {
        finalGameResult = "undercovers_win";
      } else if (remainingMrWhite.length > 0 && remainingCivilians.length > 0 && remainingUndercovers.length === 0) {
        finalGameResult = "mr_white_win";
      } else if (remainingCivilians.length === 0 && remainingUndercovers.length > 0 && remainingMrWhite.length > 0) {
        finalGameResult = "undercovers_mrwhite_win";
      }

      if (finalGameResult) {
        await ctx.db.patch(args.roomId, {
          gameState: "results",
        });
        gameResult = finalGameResult;
        action = "game_ended";
      } else {
        // Reset for next round
        const allPlayers = await ctx.db
          .query("players")
          .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
          .collect();

        for (const player of allPlayers) {
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
        action = "next_round";
      }
    }

    return {
      gameState: room.gameState,
      action,
      gameResult,
      alivePlayers: players.length,
      aliveUndercovers: aliveUndercovers.length,
      aliveCivilians: aliveCivilians.length,
      aliveMrWhite: aliveMrWhite.length
    };
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
      // Civilians win if all undercovers AND all Mr. White are eliminated
      if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
        gameResult = "civilians_win";
      }
      // Undercovers win if they equal or outnumber civilians (and no Mr. White)
      else if (aliveUndercovers.length >= aliveCivilians.length && aliveMrWhite.length === 0) {
        gameResult = "undercovers_win";
      }
      // Mr. White solo victory: survives to end with at least one civilian
      else if (aliveMrWhite.length > 0 && aliveCivilians.length > 0 && aliveUndercovers.length === 0) {
        gameResult = "mr_white_win";
      }
      // Joint victory: Undercovers + Mr. White win if all civilians eliminated
      else if (aliveCivilians.length === 0 && aliveUndercovers.length > 0 && aliveMrWhite.length > 0) {
        gameResult = "undercovers_mrwhite_win";
      }
      else {
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
