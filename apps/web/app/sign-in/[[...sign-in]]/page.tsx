"use client";

import { SignIn } from "@clerk/nextjs";
import WebOnlyRoute from "../../../components/WebOnlyRoute";

function buildFallbackRedirectUrl() {
  if (typeof window === "undefined") return "/onboarding"
  try {
    const url = new URL(window.location.href)
    const voucher = url.searchParams.get("voucher")
    if (voucher && String(voucher).trim().length > 0) {
      return `/onboarding?voucher=${encodeURIComponent(voucher.trim())}`
    }
  } catch {
    // ignore
  }
  return "/onboarding"
}

export default function SignInPage() {
  const getSignUpUrl = () => {
    if (typeof window === "undefined") return "/sign-up"
    try {
      const url = new URL(window.location.href)
      const voucher = url.searchParams.get("voucher")
      return voucher ? `/sign-up?voucher=${encodeURIComponent(voucher)}` : "/sign-up"
    } catch {
      return "/sign-up"
    }
  }

  return (
    <WebOnlyRoute>
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
          signUpUrl={getSignUpUrl()}
          fallbackRedirectUrl={buildFallbackRedirectUrl()}
        />
      </div>
    </WebOnlyRoute>
  );
}
