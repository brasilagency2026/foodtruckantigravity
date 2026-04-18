"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
      if (msg?.includes("password")) {
        setError("Senha incorreta. Tente novamente.");
      } else if (msg?.includes("identifier")) {
        setError("Nenhuma conta encontrada com esse e-mail.");
      } else {
        setError("Falha na autenticação. Verifique suas credenciais.");
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

        <form onSubmit={handleSubmit} style={{ background: "#0f0f1a", padding: 32, borderRadius: 16, border: "1px solid rgba(255,107,53,0.15)" }}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
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
