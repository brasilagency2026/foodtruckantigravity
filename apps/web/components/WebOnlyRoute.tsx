"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import Link from "next/link";

interface WebOnlyRouteProps {
  children: React.ReactNode;
}

export default function WebOnlyRoute({ children }: WebOnlyRouteProps) {
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    // Detect Capacitor native environment
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // During SSR or before detection, render a blank loader or minimal background
  if (isNative === null) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(255,107,53,0.2)",
          borderTop: "3px solid #FF6B35",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If running inside native iOS/Android shell, block route and show web-only notice
  if (isNative) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080810",
        color: "#f0f0f8",
        fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow Effects */}
        <div style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0
        }} />

        <div style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,107,53,0.15)",
          borderRadius: "24px",
          padding: "48px 32px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), 0 0 60px rgba(255,107,53,0.05)",
          position: "relative",
          zIndex: 1
        }}>
          {/* Icon Badge */}
          <div style={{
            width: "80px",
            height: "80px",
            background: "rgba(255,107,53,0.1)",
            border: "1px solid rgba(255,107,53,0.25)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            marginBottom: "24px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            🖥️
          </div>

          <h1 style={{
            fontSize: "24px",
            fontWeight: "800",
            fontFamily: "'Syne', sans-serif",
            color: "#fff",
            marginBottom: "16px",
            letterSpacing: "-0.02em"
          }}>
            Painel Administrativo
          </h1>
          
          <p style={{
            fontSize: "15px",
            color: "rgba(240,240,248,0.65)",
            lineHeight: "1.6",
            marginBottom: "24px"
          }}>
            Esta área é destinada exclusivamente a proprietários de Food Trucks para o cadastro e gerenciamento de seus negócios.
          </p>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px"
          }}>
            <p style={{
              fontSize: "13px",
              color: "rgba(240,240,248,0.45)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: "700"
            }}>
              Acesse pelo computador
            </p>
            <p style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#FF6B35",
              margin: 0
            }}>
              www.foodpronto.com.br
            </p>
          </div>

          <Link href="/" style={{
            display: "block",
            background: "#FF6B35",
            color: "#fff",
            textAlign: "center",
            padding: "16px 24px",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: "800",
            textDecoration: "none",
            transition: "opacity 0.2s",
            boxShadow: "0 8px 24px rgba(255,107,53,0.3)"
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}>
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  // Render original page if running in web browser
  return <>{children}</>;
}
