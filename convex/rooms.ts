import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateRoomCode, generateSessionId } from "../src/lib/utils";
import { GAME_CONFIG } from "../src/lib/constants";
import {
  RoomNotFoundError,
  GameAlreadyStartedError,
  RoomFullError,
  PlayerNameExistsError,
  InvalidSessionError
} from "../src/lib/errors";

export const createRoom = mutation({
  args: {
    hostName: v.string(),
  },
  handler: async (ctx, args) => {
    const roomCode = generateRoomCode();
    const now = Date.now();

    const roomId = await ctx.db.insert("rooms", {
      code: roomCode,
      hostId: `host_${now}`,
      gameState: "waiting",
      currentRound: 0,
      maxRounds: GAME_CONFIG.MAX_ROUNDS,
      currentPlayerIndex: 0,
      playerOrder: [],
      hasMrWhite: false,
      numUndercovers: 1,
      createdAt: now,
    });

    // Add host as first player
    const hostSessionId = generateSessionId();
    await ctx.db.insert("players", {
      roomId,
      name: args.hostName,
      sessionId: hostSessionId,
      isHost: true,
      isAlive: true,
      role: "civilian", // Will be reassigned when game starts
      votes: [],
      hasSharedWord: false,
      createdAt: now,
    });

    return { roomId, roomCode, sessionId: hostSessionId };
  },
});

export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    playerName: v.string(),
    sessionId: v.optional(v.string()), // Optional sessionId for rejoining
    isHost: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.roomCode))
      .first();

    if (!room) {
      throw new RoomNotFoundError(args.roomCode);
    }

    if (room.gameState !== "waiting") {
      throw new GameAlreadyStartedError();
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (players.length >= GAME_CONFIG.MAX_PLAYERS) {
      throw new RoomFullError();
    }

    // If sessionId is provided, try to rejoin existing player
    if (args.sessionId) {
      const existingPlayer = players.find(p => p.sessionId === args.sessionId);
      if (existingPlayer) {
        // Valid sessionId - allow rejoin
        return {
          roomId: room._id,
          playerId: existingPlayer._id,
          sessionId: existingPlayer.sessionId,
          isExisting: true
        };
      } else {
        // Invalid sessionId - might be from different room or expired
        throw new InvalidSessionError();
      }
    }

    // New player joining - check for name conflicts
    const existingPlayerWithName = players.find(p => p.name === args.playerName);
    if (existingPlayerWithName) {
      // Name already taken by another player
      throw new PlayerNameExistsError(args.playerName);
    }

    // Create new player
    const now = Date.now();
    const isHostPlayer = args.isHost || players.length === 0;
    const newSessionId = generateSessionId();

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      sessionId: newSessionId,
      isHost: isHostPlayer,
      isAlive: true,
      role: "civilian", // Will be reassigned when game starts
      votes: [],
      hasSharedWord: false,
      createdAt: now,
    });

    return {
      roomId: room._id,
      playerId,
      sessionId: newSessionId,
      isExisting: false
    };
  },
});

export const getRoom = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.roomCode))
      .first();

    if (!room) {
      return null;
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    return {
      ...room,
      players,
    };
  },
});

export const getPlayers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

