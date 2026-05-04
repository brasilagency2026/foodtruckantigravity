import { query } from "./_generated/server";

export const getAllTokens = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pushTokens").order("desc").take(10);
  },
});
