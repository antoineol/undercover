import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGameWords = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameWords")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .first();
  },
});
