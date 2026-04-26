"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <SignIn 
        appearance={{
          variables: {
            colorPrimary: "#FF6B35",
            colorBackground: "#0f0f1a",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.5)",
            colorInputBackground: "rgba(255,255,255,0.05)",
            colorInputText: "#ffffff",
          },
          elements: {
            card: {
              border: "1px solid rgba(255,107,53,0.15)",
              boxShadow: "none",
            },
            formButtonPrimary: {
              fontWeight: "700",
            },
            footerActionLink: {
              color: "#FF6B35",
              fontWeight: "600",
            }
          }
        }}
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/onboarding"
      />
    </div>
  );
}
