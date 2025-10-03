import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Update room game configuration
 */
export const updateGameConfig = mutation({
  args: {
    roomId: v.id('rooms'),
    numUndercovers: v.number(),
    numMrWhites: v.number(),
  },
  handler: async (ctx, { roomId, numUndercovers, numMrWhites }) => {
    await ctx.db.patch(roomId, {
      numUndercovers,
      numMrWhites,
    });
  },
});

/**
 * Get room game configuration
 */
export const getGameConfig = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    return {
      numUndercovers: room.numUndercovers || 1,
      numMrWhites: room.numMrWhites || 0,
    };
  },
});
