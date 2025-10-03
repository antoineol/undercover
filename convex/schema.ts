import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    hostId: v.string(),
    gameState: v.union(
      v.literal('waiting'),
      v.literal('discussion'),
      v.literal('voting'),
      v.literal('mr_white_guessing'),
      v.literal('results')
    ),
    currentRound: v.number(),
    maxRounds: v.number(),
    currentPlayerIndex: v.optional(v.number()), // Index of current player to share word
    playerOrder: v.optional(v.array(v.id('players'))), // Order of players for word sharing
    hasMrWhite: v.optional(v.boolean()), // Whether Mr. White is enabled for this room
    numUndercovers: v.optional(v.number()), // Number of undercover players
    createdAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_host', ['hostId']),

  players: defineTable({
    roomId: v.id('rooms'),
    name: v.string(),
    sessionId: v.optional(v.string()), // Unique session identifier for this player
    isHost: v.boolean(),
    isAlive: v.boolean(),
    role: v.union(
      v.literal('undercover'),
      v.literal('civilian'),
      v.literal('mr_white')
    ),
    votes: v.array(v.id('players')),
    sharedWord: v.optional(v.string()),
    hasSharedWord: v.optional(v.boolean()),
    hasVoted: v.optional(v.boolean()), // Track if player has participated in voting
    createdAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_room_alive', ['roomId', 'isAlive'])
    .index('by_session', ['sessionId']),

  gameWords: defineTable({
    roomId: v.id('rooms'),
    civilianWord: v.string(),
    undercoverWord: v.string(),
    mrWhiteWord: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_room', ['roomId']),
});
