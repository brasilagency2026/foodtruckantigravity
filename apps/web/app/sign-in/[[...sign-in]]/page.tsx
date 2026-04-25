"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace("/onboarding");
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      } else {
        setError(`Status inesperado: ${result.status}`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || JSON.stringify(err);
      if (typeof msg === 'string' && msg.includes("password")) {
        setError("Senha incorreta. Tente novamente.");
      } else if (typeof msg === 'string' && msg.includes("identifier")) {
        setError("Nenhuma conta encontrada com esse e-mail.");
      } else {
        setError(`Erro: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🍔</span>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>Bem-vindo de volta</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>Entre na sua conta para gerenciar seu food truck.</p>
        </div>

        <form noValidate onSubmit={handleSubmit} style={{ background: "#0f0f1a", padding: 32, borderRadius: 16, border: "1px solid rgba(255,107,53,0.15)" }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!isLoaded}
            onClick={async () => {
              if (!signIn) return;
              try {
                await signIn.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/sign-in", redirectUrlComplete: "/onboarding" });
              } catch (err) {
                console.error("Google OAuth error:", err);
                setError("Erro ao conectar com Google. Tente novamente.");
              }
            }}
            style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 600, fontSize: 15, cursor: !isLoaded ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s", marginBottom: 24, opacity: !isLoaded ? 0.5 : 1, position: "relative", zIndex: 1 }}
            onMouseEnter={(e) => { if (isLoaded) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuar com Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width: "100%", padding: "12px 14px", paddingRight: 48, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isLoaded}
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: isSubmitting ? "rgba(255,107,53,0.5)" : "#FF6B35", color: "#fff", fontWeight: 700, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
            Não tem conta?{" "}
            <a href="/sign-up" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
              Cadastre-se
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
