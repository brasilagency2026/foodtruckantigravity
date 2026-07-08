"use client";

import { SignUp } from "@clerk/nextjs";
import WebOnlyRoute from "../../../components/WebOnlyRoute";

function buildFallbackRedirectUrl() {
  // Le lien commercial ressemble à : /sign-up?email=<partner_email>
  // On évite d’envoyer systématiquement vers /onboarding : si un partner email est présent,
  // on redirige d’abord vers le panel commercial.
  if (typeof window === "undefined") return "/onboarding"

  try {
    const url = new URL(window.location.href)
    const email = url.searchParams.get("email")
    if (email && String(email).trim().length > 0) {
      return "/comercial/dashboard"
    }
  } catch {
    // ignore
  }

  return "/onboarding"
}

export default function SignUpPage() {
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
          signInUrl="/sign-in"
          fallbackRedirectUrl={buildFallbackRedirectUrl()}
        />
      </div>
    </WebOnlyRoute>
  )
}

