"use client";

import { SignUp } from "@clerk/nextjs";
import WebOnlyRoute from "../../../components/WebOnlyRoute";

function buildFallbackRedirectUrl() {
  if (typeof window === "undefined") return "/onboarding"

  try {
    const url = new URL(window.location.href)
    const redirectUrl = url.searchParams.get("redirect_url")
    if (redirectUrl && String(redirectUrl).trim().length > 0) {
      return redirectUrl
    }

    const email = url.searchParams.get("email")
    if (email && String(email).trim().length > 0) {
      return "/comercial/dashboard"
    }

    const voucher = url.searchParams.get("voucher")
    if (voucher && String(voucher).trim().length > 0) {
      return `/onboarding?voucher=${encodeURIComponent(voucher.trim())}`
    }
  } catch {
    // ignore
  }

  return "/onboarding"
}

export default function SignUpPage() {
  const getSignInUrl = () => {
    if (typeof window === "undefined") return "/sign-in"
    try {
      const url = new URL(window.location.href)
      const voucher = url.searchParams.get("voucher")
      return voucher ? `/sign-in?voucher=${encodeURIComponent(voucher)}` : "/sign-in"
    } catch {
      return "/sign-in"
    }
  }

  return (
    <WebOnlyRoute>
      <div
        style={{
          minHeight: "100vh",
          background: "#080810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <SignUp
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
              },
            },
          }}
          signInUrl={getSignInUrl()}
          fallbackRedirectUrl={buildFallbackRedirectUrl()}
        />
      </div>
    </WebOnlyRoute>
  )
}

