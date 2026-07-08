"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import WebOnlyRoute from "../../../../components/WebOnlyRoute";

function SignInContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
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
          },
        },
      }}
      signUpUrl="/comercial/sign-up"
      fallbackRedirectUrl="/comercial/dashboard"
      forceRedirectUrl="/comercial/dashboard"
      initialValues={email ? { emailAddress: email } : undefined}
    />
  );
}

export default function ComercialSignInPage() {
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
          flexDirection: "column",
          gap: "20px",
          padding: "20px"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <h1 style={{ color: "#FF6B35", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>
            Painel Comercial
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            Entre na sua conta comercial
          </p>
        </div>
        <Suspense fallback={<div style={{ color: "white" }}>Carregando formulário...</div>}>
          <SignInContent />
        </Suspense>
      </div>
    </WebOnlyRoute>
  );
}
