"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "signup") {
        await signIn("password", { email, password, flow: "signUp" });
      } else {
        await signIn("password", { email, password, flow: "signIn" });
      }
      router.push("/onboarding");
    } catch (err: any) {
      setError(
        mode === "signup"
          ? "Falha ao criar conta. Tente novamente."
          : "Falha na autenticação. Verifique suas credenciais."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontFamily: "system-ui" }}>
      <form onSubmit={handleSubmit} style={{ background: "#0f0f1a", padding: 40, borderRadius: 20, border: "1px solid rgba(255,107,53,0.1)", width: "100%", maxWidth: 400 }}>

        <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 30 }}>
          {mode === "signup" ? "Crie sua conta para cadastrar seu food truck." : "Entre na sua conta para gerenciar seu food truck."}
        </p>
        
        {error && <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#FFF" }}
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#FFF" }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: "#FF6B35", color: "#FFF", fontWeight: "700", cursor: "pointer", transition: "opacity 0.2s" }}
        >
          {isSubmitting ? "Carregando..." : mode === "signup" ? "Cadastrar" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
