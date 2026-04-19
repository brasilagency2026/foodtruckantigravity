const domain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ||
  process.env.CLERK_FRONTEND_API_URL ||
  "https://balanced-deer-33.clerk.accounts.dev";

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
