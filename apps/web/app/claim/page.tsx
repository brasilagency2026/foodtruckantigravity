"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import WebOnlyRoute from "../../components/WebOnlyRoute";

function ClaimPageContent() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [token, setToken] = useState<string>("");
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Extract token from URL client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("token");
      if (t) {
        setToken(t);
      } else {
        setErrorMsg("Token de transferência ausente no link.");
      }
    }
  }, []);

  // Fetch truck information if token is available
  const truck = useQuery(
    api.admin.getTruckByTransferToken,
    token ? { transferToken: token } : "skip"
  );

  const claimTruck = useMutation(api.admin.claimFoodTruck);

  // Handle claiming process
  const handleClaim = async () => {
    if (!token) return;
    setClaiming(true);
    setErrorMsg("");
    try {
      const truckId = await claimTruck({ transferToken: token });
      router.push(`/dashboard/${truckId}`);
    } catch (e: any) {
      setErrorMsg(e.message || "Erro ao reivindicar a propriedade.");
      setClaiming(false);
    }
  };

  // Loading state
  if (!isLoaded || (token && truck === undefined)) {
    return (
      <div className="claim-container flex items-center justify-center">
        <style>{CSS}</style>
        <div className="text-center text-gray-400 font-medium">
          Carregando informações...
        </div>
      </div>
    );
  }

  // Error or Invalid Token state
  if (errorMsg || (token && truck === null)) {
    return (
      <div className="claim-container flex items-center justify-center">
        <style>{CSS}</style>
        <div className="claim-card text-center">
          <div className="claim-icon text-red-500">⚠️</div>
          <h1 className="claim-title text-red-400">Link Inválido</h1>
          <p className="claim-text">
            {errorMsg || "Este link de transferência é inválido ou já foi utilizado."}
          </p>
          <button onClick={() => router.push("/")} className="btn-primary mt-6">
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // If truck exists but not logged in
  if (!isSignedIn) {
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/claim?token=${token}`)}`;
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/claim?token=${token}`)}`;

    return (
      <div className="claim-container flex items-center justify-center">
        <style>{CSS}</style>
        <div className="claim-card">
          <div className="claim-icon">🚛</div>
          <h1 className="claim-title">Assumir Propriedade</h1>
          <p className="claim-text">
            Você foi convidado para gerenciar o food truck <strong className="text-white">{truck?.name}</strong> no Food Pronto.
          </p>
          <p className="claim-subtext">
            Crie sua conta ou faça login para assumir o controle do seu negócio.
          </p>
          <div className="flex flex-col gap-3 mt-8">
            <button
              onClick={() => router.push(signUpUrl)}
              className="btn-primary"
            >
              Criar Minha Conta
            </button>
            <button
              onClick={() => router.push(signInUrl)}
              className="btn-secondary"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in state - ready to claim
  return (
    <div className="claim-container flex items-center justify-center">
      <style>{CSS}</style>
      <div className="claim-card">
        <div className="claim-icon">🎉</div>
        <h1 className="claim-title">Quase Pronto!</h1>
        <p className="claim-text">
          Você está conectado como <span className="text-[#FF6B35] font-semibold">{user.primaryEmailAddress?.emailAddress}</span>.
        </p>
        <p className="claim-subtext">
          Clique abaixo para confirmar e assumir o controle total de <strong className="text-white">{truck?.name}</strong>.
        </p>

        {errorMsg && <p className="error-banner">{errorMsg}</p>}

        <button
          onClick={handleClaim}
          disabled={claiming}
          className="btn-primary mt-8 w-full"
        >
          {claiming ? "Reivindicando..." : "Confirmar e Assumir Controle"}
        </button>
      </div>
    </div>
  );
}

const CSS = `
  .claim-container {
    min-height: 100vh;
    background: #080810;
    color: #f0f0f8;
    font-family: 'Nunito', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .claim-card {
    background: #0f0f1a;
    border: 1px solid rgba(255, 107, 53, 0.15);
    border-radius: 16px;
    padding: 40px 32px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    text-align: center;
  }
  .claim-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  .claim-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #FF6B35;
    margin-bottom: 16px;
  }
  .claim-text {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 8px;
  }
  .claim-subtext {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    line-height: 1.5;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .gap-3 {
    gap: 12px;
  }
  .mt-6 {
    margin-top: 24px;
  }
  .mt-8 {
    margin-top: 32px;
  }
  .w-full {
    width: 100%;
  }
  .btn-primary {
    background: #FF6B35;
    color: #fff;
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-primary:hover:not(:disabled) {
    background: #e05a2b;
    transform: translateY(-1px);
  }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-secondary {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  .error-banner {
    background: rgba(239, 68, 68, 0.15);
    color: #EF4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 12px;
    border-radius: 6px;
    margin-top: 16px;
    font-size: 14px;
    text-align: left;
  }
`;

export default function ClaimPage() {
  return (
    <WebOnlyRoute>
      <ClaimPageContent />
    </WebOnlyRoute>
  );
}
