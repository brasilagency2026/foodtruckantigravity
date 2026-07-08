"use client";

import { SignUp, SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ============================================
// 1. PAGE SIGN-UP GÉNÉRALE (AVEC VOUCHER)
// ============================================

function buildSignUpFallbackRedirectUrl() {
  if (typeof window === "undefined") return "/onboarding";

  try {
    const url = new URL(window.location.href);
    
    // Si l'URL contient un email commercial, on le redirige vers son dashboard
    const email = url.searchParams.get("email");
    if (email && String(email).trim().length > 0) {
      return "/comercial/dashboard";
    }

    // Si l'URL contient un voucher de parrainage client, on le transmet à la redirection
    const voucher = url.searchParams.get("voucher");
    if (voucher && String(voucher).trim().length > 0) {
      return `/onboarding?voucher=${encodeURIComponent(voucher.trim())}`;
    }
  } catch {
    // ignore
  }

  return "/onboarding";
}

export function SignUpPage() {
  // Transmettre le voucher s'il bascule vers "Sign In"
  const getSignInUrl = () => {
    if (typeof window === "undefined") return "/sign-in";
    try {
      const url = new URL(window.location.href);
      const voucher = url.searchParams.get("voucher");
      return voucher ? `/sign-in?voucher=${encodeURIComponent(voucher)}` : "/sign-in";
    } catch {
      return "/sign-in";
    }
  };

  return (
    <SignUp
      signInUrl={getSignInUrl()}
      fallbackRedirectUrl={buildSignUpFallbackRedirectUrl()}
    />
  );
}


// ============================================
// 2. PAGE SIGN-UP SPÉCIFIQUE COMMERCIAL
// ============================================

function ComercialSignUpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <SignUp
      signInUrl="/comercial/sign-in"
      fallbackRedirectUrl="/comercial/dashboard" // Redirection forcée vers son panel
      forceRedirectUrl="/comercial/dashboard"
      initialValues={email ? { emailAddress: email } : undefined}
    />
  );
}

export function ComercialSignUpPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ComercialSignUpContent />
    </Suspense>
  );
}
