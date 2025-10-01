import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
      maxRounds: 3,
      currentPlayerIndex: 0,
      playerOrder: [],
      createdAt: now,
    });

    // Add host as first player
    await ctx.db.insert("players", {
      roomId,
      name: args.hostName,
      isHost: true,
      isAlive: true,
      role: "civilian", // Will be reassigned when game starts
      votes: [],
      hasSharedWord: false,
      createdAt: now,
    });

    return { roomId, roomCode };
  },
});

export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    playerName: v.string(),
    isHost: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.roomCode))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState !== "waiting") {
      throw new Error("Game has already started");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    if (players.length >= 10) {
      throw new Error("Room is full");
    }

    // Check if player with same name already exists
    const existingPlayer = players.find(p => p.name === args.playerName);
    if (existingPlayer) {
      // Return existing player data
      return { roomId: room._id, playerId: existingPlayer._id, isExisting: true };
    }

    const now = Date.now();
    const isHostPlayer = args.isHost || players.length === 0;

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: args.playerName,
      isHost: isHostPlayer,
      isAlive: true,
      role: "civilian", // Will be reassigned when game starts
      votes: [],
      hasSharedWord: false,
      createdAt: now,
    });

    return { roomId: room._id, playerId, isExisting: false };
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

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
