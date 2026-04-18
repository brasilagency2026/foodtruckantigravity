"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message;
      if (msg?.includes("password")) {
        setError("A senha deve ter pelo menos 8 caracteres.");
      } else if (msg?.includes("already") || msg?.includes("taken")) {
        setError("Esse e-mail já está cadastrado. Tente entrar.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError("Código inválido. Verifique e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>🍔</span>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginTop: 12, marginBottom: 8 }}>
            {pendingVerification ? "Verifique seu e-mail" : "Crie sua conta"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: 0 }}>
            {pendingVerification
              ? `Enviamos um código de verificação para ${email}`
              : "Cadastre-se para gerenciar seu food truck."}
          </p>
        </div>

        <form
          onSubmit={pendingVerification ? handleVerify : handleSubmit}
          style={{ background: "#0f0f1a", padding: 32, borderRadius: 16, border: "1px solid rgba(255,107,53,0.15)" }}
        >
          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14, textAlign: "center" }}>
              {error}
            </div>
          )}

          {!pendingVerification ? (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  style={inputStyle}
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
                    placeholder="Mínimo 8 caracteres"
                    style={{ ...inputStyle, paddingRight: 48 }}
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
            </>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Código de verificação</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder="123456"
                style={{ ...inputStyle, textAlign: "center", fontSize: 24, letterSpacing: 8 }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isLoaded}
            style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: isSubmitting ? "rgba(255,107,53,0.5)" : "#FF6B35", color: "#fff", fontWeight: 700, fontSize: 15, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s" }}
          >
            {isSubmitting
              ? "Aguarde..."
              : pendingVerification
              ? "Verificar"
              : "Cadastrar"}
          </button>

          {!pendingVerification && (
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              Já tem conta?{" "}
              <a href="/sign-in" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
                Entrar
              </a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
