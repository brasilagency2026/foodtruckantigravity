import { v } from "convex/values";
import { action } from "./_generated/server";

export const debugTokens = action({
  args: {},
  handler: async (ctx) => {
    const testToken = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST;
    const prodToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    
    return {
      hasTestToken: !!testToken,
      testTokenPrefix: testToken ? testToken.substring(0, 15) : "none",
      hasProdToken: !!prodToken,
      prodTokenPrefix: prodToken ? prodToken.substring(0, 15) : "none",
    };
  },
});
